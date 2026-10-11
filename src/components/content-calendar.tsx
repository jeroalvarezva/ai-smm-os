"use client";

import Link from "next/link";
import { useState } from "react";

export type CalendarContentItem = {
  id: string;
  title: string;
  description: string | null;
  platform: string;
  contentType: string;
  status: string;
  scheduledAt: string;
};

function label(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase().replaceAll("_", " ");
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function calendarStart(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return start;
}

export function ContentCalendar({ clientId, items }: { clientId: string; items: CalendarContentItem[] }) {
  const today = new Date();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const scheduledItems = items.filter((item) => parseDate(item.scheduledAt));
  const unscheduledItems = items.filter((item) => !parseDate(item.scheduledAt));
  const byDate = new Map<string, CalendarContentItem[]>();

  for (const item of scheduledItems) {
    const date = parseDate(item.scheduledAt);
    if (!date) continue;
    const key = dateKey(date);
    byDate.set(key, [...(byDate.get(key) ?? []), item]);
  }

  const start = calendarStart(month);
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
  const monthLabel = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(month);
  const todayKey = dateKey(today);

  function moveMonth(offset: number) {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  function goToToday() {
    setMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  }

  return (
    <>
      <section className="calendar-panel" aria-labelledby="calendar-title">
        <div className="calendar-toolbar">
          <div>
            <p className="eyebrow">Scheduled content</p>
            <h2 id="calendar-title">{monthLabel}</h2>
          </div>
          <div className="calendar-controls">
            <button type="button" className="button button-secondary" onClick={() => moveMonth(-1)} aria-label="Previous month">&lt;</button>
            <button type="button" className="button button-secondary" onClick={goToToday}>Today</button>
            <button type="button" className="button button-secondary" onClick={() => moveMonth(1)} aria-label="Next month">&gt;</button>
          </div>
        </div>

        <div className="calendar-week-header" aria-hidden="true">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day}>{day}</span>)}
        </div>
        <div className="calendar-grid" role="grid" aria-label={`${monthLabel} content calendar`}>
          {days.map((date) => {
            const key = dateKey(date);
            const dayItems = byDate.get(key) ?? [];
            const isCurrentMonth = date.getMonth() === month.getMonth();
            const isToday = key === todayKey;
            return (
              <div className={`calendar-day${isCurrentMonth ? "" : " calendar-day-outside"}${isToday ? " calendar-day-today" : ""}`} role="gridcell" key={key}>
                <span className="calendar-day-number">{date.getDate()}</span>
                <div className="calendar-day-items">
                  {dayItems.map((item) => (
                    <Link className="calendar-item" href={`/clients/${clientId}/content/${item.id}/edit?returnTo=calendar`} key={item.id} title={`${item.title} · ${label(item.platform)} · ${label(item.contentType)}`}>
                      <strong>{item.title}</strong>
                      <span>{label(item.platform)} · {label(item.contentType)}</span>
                      <small>{label(item.status)}</small>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="unscheduled-panel" aria-labelledby="unscheduled-title">
        <div className="section-heading">
          <div><p className="eyebrow">Needs a date</p><h2 id="unscheduled-title">Unscheduled Content</h2></div>
          <span className="section-note">{unscheduledItems.length} {unscheduledItems.length === 1 ? "item" : "items"}</span>
        </div>
        {unscheduledItems.length === 0 ? (
          <p className="calendar-empty-note">All content items have a scheduled date.</p>
        ) : (
          <div className="unscheduled-list">
            {unscheduledItems.map((item) => (
              <Link className="unscheduled-row" href={`/clients/${clientId}/content/${item.id}/edit?returnTo=calendar`} key={item.id}>
                <strong>{item.title}</strong>
                <span>{label(item.platform)}</span>
                <span>{label(item.contentType)}</span>
                <span className="content-status">{label(item.status)}</span>
                <span className="client-row-arrow">-&gt;</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
