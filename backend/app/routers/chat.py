from __future__ import annotations

import os
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse

from app.schemas.chat import ChatRequest, ChatResponse
from app.services.savi_agent import (
    EXCEL_PATH,
    get_savi_response,
    extract_ticket_data,
    save_to_excel,
)

router = APIRouter()


@router.post("/message", response_model=ChatResponse)
async def chat_message(request: ChatRequest) -> ChatResponse:
    """
    Handle incoming messages to Savi, manage turn limits, check for ticket triggers,
    and save tickets to Excel.
    """
    # Max conversation turns: 20 (including history).
    # If the history already has 20 or more messages, escalate and save immediately.
    if len(request.messages) >= 20:
        conversation_text = ""
        for msg in request.messages:
            conversation_text += f"{msg.role.capitalize()}: {msg.content}\n"
        conversation_text += f"User: {request.user_message}\n"

        # Force save whatever details were gathered
        ticket_data = await extract_ticket_data(conversation_text)
        ticket_id = save_to_excel(ticket_data)

        escalation_reply = (
            "We've reached our conversation limit. To make sure you get help quickly, "
            "I've gone ahead and logged a support ticket with the details we've discussed. "
            "Our team will look into this and get back to you within 24 hours. "
            f"Your ticket reference is {ticket_id}. Warmly, Savi"
        )
        return ChatResponse(
            reply=escalation_reply,
            ticket_saved=True,
            ticket_id=ticket_id,
        )

    try:
        # Get streaming response from Savi
        response_chunks = []
        async for chunk in get_savi_response(request.messages, request.user_message):
            response_chunks.append(chunk)
        reply = "".join(response_chunks)

        # Detect phrase "I'll log this for you" in the assistant's reply (case-insensitive)
        ticket_saved = False
        ticket_id = None
        if "i'll log this for you" in reply.lower():
            # Build the full conversation text context for the extraction model
            conversation_text = ""
            for msg in request.messages:
                conversation_text += f"{msg.role.capitalize()}: {msg.content}\n"
            conversation_text += f"User: {request.user_message}\n"
            conversation_text += f"Assistant (Savi): {reply}\n"

            # Extract structured data
            ticket_data = await extract_ticket_data(conversation_text)
            
            # Save to support_tickets.xlsx
            ticket_id = save_to_excel(ticket_data)
            ticket_saved = True

        return ChatResponse(
            reply=reply,
            ticket_saved=ticket_saved,
            ticket_id=ticket_id,
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Savi agent error: {str(e)}",
        )


@router.get("/tickets/export")
async def export_tickets():
    """
    Export the support tickets spreadsheet (admin access).
    """
    if not EXCEL_PATH.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No support tickets spreadsheet exists yet.",
        )

    return FileResponse(
        path=str(EXCEL_PATH),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename="support_tickets.xlsx",
    )
