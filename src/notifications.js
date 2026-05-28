function Notifications({ notifications }) {
    return (
        <>
            {notifications.map((notification, index) => (
                <div
                    key={notification.id}
                    className={`notification show ${notification.hide ? 'hide' : ''}`}
                    style={{ top: `${100 + index * 70}px` }}
                >
                    {notification.message}
                </div>
            ))}
        </>
    );
}
