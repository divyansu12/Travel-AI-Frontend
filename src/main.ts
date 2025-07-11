import { bootstrapApplication } from '@angular/platform-browser';
import { TripFormComponent } from './app/trip-form/trip-form.component';
import { appConfig } from './app/app.config';

bootstrapApplication(TripFormComponent, appConfig)
  .catch(err => console.error(err));
