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
    <div className="w-full bg-[#0d1322] border border-line/80 rounded-2xl p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-accent/20 text-accent-soft border border-accent/50">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Jadwal Tayang Drakor Mingguan</h2>
            <p className="text-xs text-mute">Jadwal siaran saluran Korea (tvN, SBS, JTBC, Netflix) zona WIB (UTC+7)</p>
          </div>
        </div>

        {showAllLink && (
          <Link
            href="/jadwal"
            className="text-xs font-semibold text-accent-soft hover:text-accent-soft flex items-center gap-1 group self-start sm:self-auto"
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
                  ? 'bg-accent text-white font-bold shadow-md shadow-accent/20'
                  : 'bg-elevated/90 text-sub hover:text-white hover:bg-line border border-line'
              }`}
            >
              <span>{day}</span>
              {isToday && (
                <span
                  className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${
                    isSelected ? 'bg-canvas text-accent-soft' : 'bg-accent text-accent-soft'
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
                className="flex items-center justify-between p-3 rounded-xl bg-elevated/60 border border-line/80 hover:border-accent/30 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {drama?.posterUrl && (
                    <div className="w-12 h-16 rounded-lg overflow-hidden bg-canvas shrink-0 border border-line">
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
                      <span className="flex items-center gap-1 text-[11px] font-bold text-accent-soft">
                        <Clock className="w-3 h-3" />
                        {item.airTime}
                      </span>
                      <span className="text-faint text-xs">·</span>
                      <span className="text-[10px] text-sub font-medium bg-line px-1.5 py-0.2 rounded">
                        {item.network}
                      </span>
                      <span className="text-faint text-xs">·</span>
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                          item.status === 'aired'
                            ? 'bg-ok text-ok border border-ok/40'
                            : 'bg-warn/80 text-warn border border-warn/40'
                        }`}
                      >
                        {item.status === 'aired' ? 'Sudah Tayang' : 'Segera Tayang'}
                      </span>
                    </div>
                    <Link
                      href={`/donghua/${drama?.slug || ''}`}
                      className="font-semibold text-sm text-ink hover:text-accent-soft transition-colors block truncate"
                    >
                      {drama?.title || 'Judul Drama Korea'}
                    </Link>
                    <p className="text-xs text-mute mt-0.5">
                      Episode {item.episodeNumber} · Sub Indo
                    </p>
                  </div>
                </div>

                <div className="shrink-0 pl-2">
                  {item.status === 'aired' ? (
                    <Link
                      href={`/watch/${drama?.slug}/${item.episodeNumber}`}
                      className="p-2 rounded-lg bg-accent/20 text-accent-soft hover:bg-accent hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold"
                      title="Tonton sekarang"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span className="hidden sm:inline">Nonton</span>
                    </Link>
                  ) : (
                    <Link
                      href={`/donghua/${drama?.slug}`}
                      className="p-2 rounded-lg bg-line text-sub hover:text-white hover:bg-line-strong transition-colors text-xs font-medium"
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
          <div className="col-span-full py-8 text-center bg-elevated/30 rounded-xl border border-dashed border-line">
            <Calendar className="w-8 h-8 text-faint mx-auto mb-2" />
            <p className="text-sm text-mute font-medium">
              Tidak ada jadwal tayang drakor pada hari {selectedDay}.
            </p>
            <p className="text-xs text-mute mt-1">
              Silakan pilih hari lain untuk melihat rilis episode terbaru.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
