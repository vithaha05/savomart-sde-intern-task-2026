import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axios';

function fetchOffers() {
  return axiosInstance.get('/offers').then(res => res.data);
}

export default function OffersPage() {
  const [filter, setFilter] = useState('all');
  const { data: offers = [], isLoading } = useQuery({ queryKey: ['offers'], queryFn: fetchOffers });

  const filtered = offers.filter(o => {
    if (filter === 'all_stores') return o.is_all_stores;
    if (filter === 'store_specific') return !o.is_all_stores;
    return true;
  });

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'all_stores', label: 'All Stores' },
    { key: 'store_specific', label: 'Your Store' },
  ];

  return (
    <div style={{padding:'0 0 16px'}}>
      <div style={{marginBottom:'20px'}}>
        <h1 style={{fontSize:'22px',fontWeight:'800',color:'#782B90',margin:'0 0 4px'}}>Special Offers</h1>
        <p style={{fontSize:'13px',color:'#9ca3af',margin:0}}>Exclusive discounts and tailored rewards just for you.</p>
      </div>
      <div style={{display:'flex',gap:'8px',marginBottom:'20px'}}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            style={{padding:'8px 16px',borderRadius:'20px',fontSize:'13px',fontWeight:'600',cursor:'pointer',border:'none',
              background: filter === tab.key ? '#782B90' : '#f3e8f7',
              color: filter === tab.key ? 'white' : '#782B90'}}>
            {tab.label}
          </button>
        ))}
      </div>
      {isLoading ? (
        <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          {[1,2,3].map(i => (
            <div key={i} style={{background:'white',borderRadius:'12px',padding:'16px',border:'1px solid #f0e6f5',height:'100px'}} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{background:'white',borderRadius:'12px',padding:'48px 24px',textAlign:'center',border:'1px solid #f0e6f5'}}>
          <div style={{fontSize:'32px',marginBottom:'12px'}}>🎁</div>
          <h3 style={{color:'#782B90',fontWeight:'700',marginBottom:'6px'}}>No offers found</h3>
          <p style={{color:'#9ca3af',fontSize:'13px'}}>Check back soon for exciting deals!</p>
          {filter !== 'all' && (
            <button onClick={() => setFilter('all')}
              style={{marginTop:'16px',padding:'8px 20px',background:'#782B90',color:'white',border:'none',borderRadius:'20px',fontSize:'13px',fontWeight:'600',cursor:'pointer'}}>
              Show All Offers
            </button>
          )}
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          {filtered.map(offer => (
            <div key={offer.id} style={{background:'white',borderRadius:'12px',border:'1px solid #f0e6f5',borderLeft:'4px solid #782B90',padding:'16px',boxShadow:'0 1px 4px rgba(120,43,144,0.08)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'6px'}}>
                <h3 style={{fontSize:'15px',fontWeight:'700',color:'#1f2937',margin:0,flex:1}}>{offer.title}</h3>
                <span style={{background:'#FFF200',color:'#782B90',fontSize:'11px',fontWeight:'800',padding:'3px 10px',borderRadius:'12px',flexShrink:0,marginLeft:'8px'}}>
                  {offer.discount_label}
                </span>
              </div>
              {offer.description && (
                <p style={{fontSize:'13px',color:'#6b7280',margin:'0 0 10px'}}>{offer.description}</p>
              )}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:'11px',color:'#9ca3af'}}>
                  Valid until {new Date(offer.valid_until).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}
                </span>
                <span style={{fontSize:'10px',fontWeight:'600',padding:'2px 8px',borderRadius:'10px',
                  background: offer.is_all_stores ? '#f0fdf4' : '#f3e8f7',
                  color: offer.is_all_stores ? '#166534' : '#782B90'}}>
                  {offer.is_all_stores ? 'ALL STORES' : 'STORE SPECIFIC'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
