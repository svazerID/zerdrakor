'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight, Play, Tv } from 'lucide-react';
import { ScheduleEntry } from '@/types/donghua';
import { getTodayWIBDay } from '@/lib/utils';

interface SchedulePreviewProps {
  schedules: ScheduleEntry[];
  showAllLink?: boolean;
}

const DAYS: Array<'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu'> = [
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
  'Minggu',
];

export function SchedulePreview({ schedules, showAllLink = true }: SchedulePreviewProps) {
  const todayWIB = getTodayWIBDay();
  const [selectedDay, setSelectedDay] = useState<string>(todayWIB);

  const daySchedules = schedules.filter((s) => s.dayOfWeek === selectedDay);

  return (
    <div className="w-full bg-[#0d1322] border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-rose-950/70 text-rose-400 border border-rose-800/50">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Jadwal Tayang Drakor Mingguan</h2>
            <p className="text-xs text-slate-400">Jadwal siaran saluran Korea (tvN, SBS, JTBC, Netflix) zona WIB (UTC+7)</p>
          </div>
        </div>

        {showAllLink && (
          <Link
            href="/jadwal"
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 group self-start sm:self-auto"
          >
            <span>Semua Jadwal Mingguan</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>

      {/* Day Selector Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {DAYS.map((day) => {
          const isToday = day === todayWIB;
          const isSelected = day === selectedDay;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-600/20'
                  : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>{day}</span>
              {isToday && (
                <span
                  className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${
                    isSelected ? 'bg-slate-950 text-rose-300' : 'bg-rose-950 text-rose-300'
                  }`}
                >
                  Hari Ini
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Schedule List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {daySchedules.length > 0 ? (
          daySchedules.map((item) => {
            const drama = item.drakor || item.donghua;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-rose-500/30 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {drama?.posterUrl && (
                    <div className="w-12 h-16 rounded-lg overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                      <img
                        src={drama.posterUrl}
                        alt={drama.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400">
                        <Clock className="w-3 h-3" />
                        {item.airTime}
                      </span>
                      <span className="text-slate-600 text-xs">·</span>
                      <span className="text-[10px] text-slate-300 font-medium bg-slate-800 px-1.5 py-0.2 rounded">
                        {item.network}
                      </span>
                      <span className="text-slate-600 text-xs">·</span>
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                          item.status === 'aired'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-800/40'
                        }`}
                      >
                        {item.status === 'aired' ? 'Sudah Tayang' : 'Segera Tayang'}
                      </span>
                    </div>
                    <Link
                      href={`/donghua/${drama?.slug || ''}`}
                      className="font-semibold text-sm text-slate-100 hover:text-rose-300 transition-colors block truncate"
                    >
                      {drama?.title || 'Judul Drama Korea'}
                    </Link>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Episode {item.episodeNumber} · Sub Indo
                    </p>
                  </div>
                </div>

                <div className="shrink-0 pl-2">
                  {item.status === 'aired' ? (
                    <Link
                      href={`/watch/${drama?.slug}/${item.episodeNumber}`}
                      className="p-2 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold"
                      title="Tonton sekarang"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span className="hidden sm:inline">Nonton</span>
                    </Link>
                  ) : (
                    <Link
                      href={`/donghua/${drama?.slug}`}
                      className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors text-xs font-medium"
                      title="Detail drama"
                    >
                      Detail
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-8 text-center bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
            <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400 font-medium">
              Tidak ada jadwal tayang drakor pada hari {selectedDay}.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Silakan pilih hari lain untuk melihat rilis episode terbaru.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
