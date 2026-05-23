import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axios';

export default function OffersPage() {
  const [activeTab, setActiveTab] = useState('All');

  const { data: offers = [], isLoading, error, refetch } = useQuery({
    queryKey: ['offers'],
    queryFn: () => axiosInstance.get('/offers').then((res) => res.data),
  });

  const filteredOffers = offers.filter((offer) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'All Stores') return offer.is_all_stores === true;
    if (activeTab === 'Your Store') return offer.is_all_stores === false;
    return true;
  });

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-page-bg py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-ink tracking-tight mb-2">
            Special Offers
          </h1>
          <p className="text-muted text-sm md:text-base">
            Discover exclusive discounts and tailored rewards just for you.
          </p>
        </div>

        {/* Tabs Filter */}
        <div className="flex gap-2 p-1.5 bg-white border border-border rounded-xl mb-8 shadow-sm max-w-md">
          {['All', 'All Stores', 'Your Store'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 text-sm font-semibold rounded-lg transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-brand-purple text-white shadow-sm'
                  : 'text-muted hover:text-brand-purple hover:bg-brand-purple/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center mb-8 shadow-sm">
            <span className="text-3xl">⚠️</span>
            <h3 className="text-lg font-bold text-red-800 mt-2">Failed to load offers</h3>
            <p className="text-red-600 text-sm mt-1 mb-4">
              {error.response?.data?.message || 'Something went wrong while fetching offers.'}
            </p>
            <button
              onClick={() => refetch()}
              className="px-6 py-2 bg-brand-purple text-white font-semibold rounded-full hover:bg-brand-purple/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2">
            {[1, 2, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 border border-border border-l-4 border-l-brand-purple/40 shadow-sm animate-pulse flex flex-col justify-between h-48"
              >
                <div>
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div className="h-6 bg-border rounded w-2/3"></div>
                    <div className="h-6 bg-border rounded-full w-16"></div>
                  </div>
                  <div className="h-4 bg-border rounded w-5/6 mb-2"></div>
                  <div className="h-4 bg-border rounded w-1/2"></div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="h-4 bg-border rounded w-24"></div>
                  <div className="h-6 bg-border rounded-full w-20"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Content List */}
        {!isLoading && !error && (
          filteredOffers.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {filteredOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white rounded-2xl p-5 border border-border border-l-4 border-l-brand-purple shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Badge & Title */}
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <h3 className="text-lg font-bold text-ink group-hover:text-brand-purple transition-colors line-clamp-1">
                        {offer.title}
                      </h3>
                      <span className="flex-shrink-0 px-2.5 py-1 bg-brand-yellow text-brand-purple font-extrabold text-xs rounded-full shadow-sm">
                        {offer.discount_label}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-muted text-sm line-clamp-3 mb-4 leading-relaxed">
                      {offer.description}
                    </p>
                  </div>

                  {/* Footer Stats & Scope */}
                  <div className="flex justify-between items-center border-t border-border/60 pt-3 mt-auto">
                    <div className="flex items-center gap-1.5 text-xs text-muted font-medium">
                      <span className="text-sm">📅</span>
                      <span>Valid until {formatDate(offer.valid_until)}</span>
                    </div>

                    {/* Store Scope Tag */}
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full ${
                        offer.is_all_stores
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-brand-purple-light text-brand-purple border border-brand-purple/10'
                      }`}
                    >
                      {offer.is_all_stores ? 'All Stores' : 'Store Specific'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-2xl border border-border p-12 text-center shadow-sm max-w-md mx-auto">
              <div className="w-16 h-16 bg-brand-purple/10 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 animate-bounce">
                🎁
              </div>
              <h3 className="text-xl font-bold text-ink mb-2">No offers found</h3>
              <p className="text-muted text-sm mb-6">
                There are no active offers in this tab right now. Check back soon for exciting deals!
              </p>
              <button
                onClick={() => setActiveTab('All')}
                className="px-6 py-2.5 bg-brand-purple text-white font-semibold rounded-full hover:bg-brand-purple/90 transition-all text-sm"
              >
                Show All Offers
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
