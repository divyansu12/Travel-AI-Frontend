import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-trip-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './trip-form.component.html',
  styleUrls: ['./trip-form.component.scss']
})
export class TripFormComponent {
  tripForm = this.fb.group({
    from: ['', Validators.required],
    to: ['', Validators.required],
    dateFrom: ['', Validators.required],
    dateTo: [''],
    budget: [0, [Validators.required, Validators.min(1)]],
    persons: [1, [Validators.required, Validators.min(1)]],
    totalDays: [1, [Validators.required, Validators.min(1)]],
    transportation: ['', Validators.required]
  });

  agentReply = '';
  loading = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  async submitForm() {
  if (this.tripForm.invalid) {
    return;
  }

  const form = this.tripForm.value;
  this.loading = true;

  try {
    const res: any = await this.http
      .post('http://localhost:3000/api/plan-trip', form)
      .toPromise();

    this.agentReply = res.reply || 'No response';
  } catch (err) {
    console.error('API error:', err);
    this.agentReply = '❌ Error fetching travel plan.';
  }

  this.loading = false;
}

  async submitForm1() {
    if (this.tripForm.invalid) {
      return; // Prevent submission if the form is invalid
    }

    const form = this.tripForm.value;
    const prompt = `I want to plan a detailed multi-day trip to a specific destination station near a visiting place.

    Trip Details:
    - Destination Station: ${form.to}
    - Total Travel Days: ${form.totalDays}
    - Number of Travelers: ${form.persons}
    - Total Budget (for all travelers combined): ₹${form.budget}

    Please provide the following:

    1. A day-wise itinerary with:
      - Transport details to reach the destination station
      - Suggested sightseeing and activities near the destination station
      - Local experiences or cultural spots in the vicinity
      - Recommended restaurants or street food options nearby

    2. Hotel suggestions for each night, categorized by budget and mid-range options, close to the destination station.

    3. Daily cost estimates (approximate), including:
      - Transport to and from the destination station
      - Accommodation
      - Food
      - Entry tickets or attractions

    4. Provide a **total estimated cost** for the entire group and compare it with the provided budget.

    Format Guidelines:
    - Use titles like **Day 1**, **Day 2**, etc.
    - Separate each day with a blank line.
    - Maintain a friendly and informative tone.
    - Mention local options and attractions near the destination station.

    Note:
    The trip should be optimized for both time and group cost, suitable for first-time travelers. Ensure recommendations are realistic within the total group budget. If the number of persons exceeds a certain limit, suggest rental car options for local travel. Additionally, check transportation details on platforms like MakeMyTrip or Paytm to provide accurate ticket prices for reaching the destination station.`;

    const openRouterApiKey = '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'; // 🔐 Replace with your OpenRouter API key
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${openRouterApiKey}`,
      'HTTP-Referer': 'http://localhost:4200',
      'Content-Type': 'application/json'
    });

    const body = {
      model: 'mistralai/mistral-7b-instruct',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    };

    this.loading = true;

    try {
      const response: any = await this.http
        .post('https://openrouter.ai/api/v1/chat/completions', body, { headers })
        .toPromise();
      this.agentReply = response.choices?.[0]?.message?.content ?? 'No response';
    } catch (err: any) {
      console.error('OpenRouter API error:', err);
      this.agentReply = '❌ Error: ' + (err?.error?.error || 'Unknown error');
    }

    this.loading = false;
  }

  get formattedReply(): string {
    return this.agentReply
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // bold
      .replace(/Total Estimated Trip Cost.*?(\d+)/gi, '<div class="budget-line">💰 <strong>Total Estimated Cost:</strong> $1</div>')
      .replace(/Hotel Options:\s*(.*?)(<br>|$)/gi, '<div class="hotel-line">🏨 <strong>Hotel Options:</strong> $1</div>');
  }
}