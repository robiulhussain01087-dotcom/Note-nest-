import React from 'react';
import { Note } from '../types';
import { FileText, ArrowRight, ShoppingBag, Eye } from 'lucide-react';

interface NoteCardProps {
  note: Note;
  onSelect: (note: Note) => void;
  onBuyNow: (note: Note) => void;
  isPurchased?: boolean;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onSelect,
  onBuyNow,
  isPurchased = false,
}) => {
  const hasOriginalPrice = note.originalPrice && note.originalPrice > note.offerPrice;
  const discountPercent = hasOriginalPrice
    ? Math.round(((note.originalPrice - note.offerPrice) / note.originalPrice) * 100)
    : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col overflow-hidden group hover:border-blue-200">
      {/* Card Header / Cover image */}
      <div className="relative aspect-16/10 overflow-hidden bg-slate-100 cursor-pointer" onClick={() => onSelect(note)}>
        <img
          src={note.coverImageUrl}
          alt={note.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80" />

        {/* Badges on image */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="bg-blue-900/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs">
            {note.course} • {note.semester}
          </span>
          {discountPercent > 0 && (
            <span className="bg-emerald-500 text-white text-[11px] font-extrabold px-2 py-1 rounded-md shadow-xs flex items-center gap-1">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Pages indicator */}
        <div className="absolute bottom-2.5 right-3 bg-slate-900/80 backdrop-blur-md text-slate-100 text-xs px-2 py-0.5 rounded-md flex items-center gap-1">
          <FileText className="w-3 h-3 text-emerald-400" />
          <span>{note.pages} Pages</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <div className="mb-2">
          <span className="text-[11px] font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase">
            {note.subject}
          </span>
          <span className="text-[11px] font-medium text-slate-500 ml-2">
            {note.unit.split(':')[0]}
          </span>
        </div>

        <h3
          onClick={() => onSelect(note)}
          className="text-base font-bold text-slate-900 line-clamp-2 hover:text-blue-900 cursor-pointer transition-colors"
          title={note.title}
        >
          {note.title}
        </h3>

        <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed flex-1">
          {note.description}
        </p>

        {/* Pricing Area */}
        <div className="pt-4 mt-3 border-t border-slate-100 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-slate-900">
              ₹{note.offerPrice}
            </span>
            {hasOriginalPrice && (
              <span className="text-xs font-semibold text-slate-400 line-through">
                ₹{note.originalPrice}
              </span>
            )}
          </div>
          {discountPercent > 0 && (
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Save ₹{note.originalPrice - note.offerPrice}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => onSelect(note)}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>View Details</span>
          </button>

          {isPurchased ? (
            <button
              onClick={() => onSelect(note)}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Read PDF</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => onBuyNow(note)}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-all shadow-sm shadow-emerald-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Buy Now</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
