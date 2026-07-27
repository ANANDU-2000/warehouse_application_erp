import "./DeliveryTimeline.css";

type Milestone = {
  label: string;
  date: string | null;
  icon: string;
};

type Props = {
  createdAt: string;
  dispatchedAt: string | null;
  arrivedAt: string | null;
  staffVerifiedAt: string | null;
  stockCommittedAt: string | null;
};

export function DeliveryTimeline({ createdAt, dispatchedAt, arrivedAt, staffVerifiedAt, stockCommittedAt }: Props) {
  const milestones: Milestone[] = [
    { label: "Created", date: createdAt, icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" },
    { label: "Dispatched", date: dispatchedAt, icon: "M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" },
    { label: "Arrived", date: arrivedAt, icon: "M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" },
    { label: "Staff Verified", date: staffVerifiedAt, icon: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" },
    { label: "Stock Committed", date: stockCommittedAt, icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" },
  ];

  const reachedIdx = milestones.reduce((max, m, i) => m.date ? i : max, -1);

  return (
    <div className="pd-timeline">
      <h3 className="pd-timeline__title">Timeline</h3>
      <div className="pd-timeline__list">
        {milestones.map((m, i) => {
          const reached = i <= reachedIdx;
          return (
            <div key={i} className={`pd-timeline__item ${reached ? "pd-timeline__item--reached" : "pd-timeline__item--pending"}`}>
              <div className="pd-timeline__dot-wrap">
                <div className="pd-timeline__dot">
                  {i === 0 && <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>}
                  {i === 1 && <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" /></svg>}
                  {i === 2 && <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" /></svg>}
                  {i === 3 && <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>}
                  {i === 4 && <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>}
                </div>
                {i < milestones.length - 1 && <div className="pd-timeline__line" />}
              </div>
              <div className="pd-timeline__content">
                <span className="pd-timeline__label">{m.label}</span>
                {m.date && (
                  <span className="pd-timeline__date">
                    {new Date(m.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
