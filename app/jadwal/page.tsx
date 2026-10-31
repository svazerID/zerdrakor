'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Play, AlertCircle, RefreshCw } from 'lucide-react';
import { fetchSchedule } from '@/lib/client/live';
import { ScheduleEntry, ScheduleStatus } from '@/types/donghua';
import { getTodayWIBDay } from '@/lib/utils';

const DAYS = ['Semua Hari', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'] as const;

export default function SchedulePage() {
  const todayWIB = getTodayWIBDay();
  const [selectedDay, setSelectedDay] = useState<string>(todayWIB);
  const [statusFilter, setStatusFilter] = useState<'all' | ScheduleStatus>('all');
  const [simulatedError, setSimulatedError] = useState(false);

  const [allSchedules, setAllSchedules] = useState<ScheduleEntry[]>([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let alive = true;
    fetchSchedule()
      .then((d) => alive && setAllSchedules(d.items))
      .catch((e) => alive && setLoadError(e?.message || 'Gagal memuat jadwal'));
    return () => {
      alive = false;
    };
  }, []);

  const filtered = allSchedules.filter((item) => {
    const matchesDay = selectedDay === 'Semua Hari' || item.dayOfWeek === selectedDay;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesDay && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Info Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-rose-400 bg-rose-950 border border-rose-800/60 px-2.5 py-0.5 rounded-full">
              Waktu Siaran: Seoul (KST) diubah ke WIB (UTC+7)
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-emerald-400 font-medium">Hari ini: {todayWIB}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Jadwal Tayang Drama Korea Mingguan
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Jadwal live dari sumber: hanya hari tayang yang tersedia di sumber, bukan jam
            siaran — jadi kolom waktu menampilkan hari, bukan jam pasti.
            {loadError ? ` (${loadError})` : ''}
          </p>
        </div>

        {/* Test Simulator Toggle for error handling requirement */}
        <button
          onClick={() => setSimulatedError(!simulatedError)}
          className="text-xs text-slate-400 hover:text-slate-300 underline underline-offset-2 self-start md:self-auto"
        >
          {simulatedError ? 'Kembalikan Tampilan Normal' : 'Simulasi Gagal Memuat Jadwal'}
        </button>
      </div>

      {/* Day Selector Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {DAYS.map((day) => {
          const isToday = day === todayWIB;
          const isSelected = day === selectedDay;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>{day}</span>
              {isToday && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
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

      {/* Filter Bar (Status) */}
      <div className="flex items-center justify-between bg-[#0b101c] border border-slate-800 rounded-xl p-3 mb-6 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Status Siaran:</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Semua ({allSchedules.length})
          </button>
          <button
            onClick={() => setStatusFilter('upcoming')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              statusFilter === 'upcoming'
                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Segera Tayang
          </button>
          <button
            onClick={() => setStatusFilter('aired')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              statusFilter === 'aired'
                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sudah Tayang
          </button>
        </div>

        <span className="text-slate-400">{filtered.length} jadwal ditemukan</span>
      </div>

      {/* Main Content Area */}
      {simulatedError ? (
        /* Error State */
        <div className="py-16 px-4 text-center bg-[#0d1322] border border-rose-900/40 rounded-2xl max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Gagal Memuat Jadwal Drakor</h3>
          <p className="text-xs text-slate-400 mb-5 leading-relaxed">
            Terjadi masalah saat mengambil data siaran drama Korea. Silakan coba muat ulang halaman.
          </p>
          <button
            onClick={() => setSimulatedError(false)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Coba Lagi</span>
          </button>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const drama = item.drakor || item.donghua;
            return (
              <div
                key={item.id}
                className="bg-[#0b101c] border border-slate-800 rounded-xl p-4 hover:border-rose-500/40 transition-all flex flex-col justify-between group"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-14 h-20 rounded-lg overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                    <img
                      src={drama?.posterUrl}
                      alt={drama?.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[11px] font-bold text-rose-400 bg-rose-950/70 border border-rose-800/50 px-2 py-0.5 rounded flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.airTime}
                      </span>
                      <span className="text-slate-600 text-xs">·</span>
                      <span className="text-[11px] text-slate-300 font-medium">
                        {item.dayOfWeek}
                      </span>
                    </div>

                    <Link
                      href={`/donghua/${drama?.slug || ''}`}
                      className="font-bold text-sm text-slate-100 hover:text-rose-300 transition-colors block line-clamp-1"
                    >
                      {drama?.title}
                    </Link>

                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                      {drama?.hangulTitle}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          item.status === 'aired'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-800/50'
                        }`}
                      >
                        {item.status === 'aired' ? 'Sudah Tayang' : 'Segera Tayang'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {item.network} · Ep {item.episodeNumber}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Pemeran: {drama?.cast?.slice(0, 1)[0] || 'Aktor Korea'}</span>
                  {item.status === 'aired' ? (
                    <Link
                      href={`/watch/${drama?.slug}/${item.episodeNumber}`}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Nonton Ep {item.episodeNumber}</span>
                    </Link>
                  ) : (
                    <Link
                      href={`/donghua/${drama?.slug}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                    >
                      Lihat Detail
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="py-16 px-4 text-center bg-[#0d1322] border border-dashed border-slate-800 rounded-2xl max-w-lg mx-auto">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">
            Tidak Ada Jadwal Tayang Drakor pada {selectedDay}
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Tidak ada penayangan episode baru yang dijadwalkan pada hari ini dengan filter yang dipilih.
          </p>
          <button
            onClick={() => {
              setSelectedDay('Semua Hari');
              setStatusFilter('all');
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Tampilkan Semua Hari
          </button>
        </div>
      )}
    </div>
  );
}
