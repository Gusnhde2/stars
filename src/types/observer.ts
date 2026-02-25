// Observer position interfaces

export interface Observer {
  latitude: number;      // Degrees (-90 to +90)
  longitude: number;     // Degrees (-180 to +180)
  elevation: number;     // Meters above sea level
  date: Date;            // UTC datetime
}

export interface ObserverInput {
  latitude: number;
  longitude: number;
  elevation: number;
  dateTime: string;      // ISO string for form handling
}

