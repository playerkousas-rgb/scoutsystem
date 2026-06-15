// ... (前略)
{filteredEvents.map((e) => (
  <div key={e.id} className="event-card">
    <h3>{e.title}</h3>
    {/* 修正後的報名按鈕 */}
    {user && (
      <EventReplyButton 
        event={e} 
        user={user} 
        childrenData={dashboardData?.children || []} 
      />
    )}
  </div>
))}
// ... (後略)
