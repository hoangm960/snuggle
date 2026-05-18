export const AppEvents = {
    DASHBOARD_REFRESH: "dashboard-refresh",
    NOTIFICATION_REFRESH: "notification-refresh",
} as const;

export const dispatch = (event: keyof typeof AppEvents) => {
    console.log(`Dispatching event: ${AppEvents[event]}`);
    window.dispatchEvent(new Event(AppEvents[event]));
};

export const listen = (event: keyof typeof AppEvents, handler: () => void) => {
    const wrapped = () => {
        console.log("received:", event); // ✅ add temporarily
        handler();
    };
    window.addEventListener(AppEvents[event], wrapped);
    return () => window.removeEventListener(AppEvents[event], wrapped);
};
