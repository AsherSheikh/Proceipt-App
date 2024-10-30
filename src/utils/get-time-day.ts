const now = new Date();

export const isMorning = now.getHours() > 5 && now.getHours() <= 12;
export const isAfternoon = now.getHours() > 12 && now.getHours() <= 18;
export const isEvening = now.getHours() > 18 || now.getHours() <= 5;
