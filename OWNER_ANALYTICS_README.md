# Owner Analytics Dashboard

## Overview

The Owner Analytics Dashboard is a comprehensive cost tracking, profitability analysis, and system health monitoring tool designed exclusively for business owners. This dashboard provides visibility into GPT API costs, usage metrics, and helps determine optimal pricing strategies.

## Access & Security

### Who Can Access
- **ONLY** users with `role = 'owner'` in the `user_profiles` table
- Admins and other roles **cannot** access this dashboard
- The route is protected via `ProtectedRoute` component with `requiredRoles={['owner']}`

### Accessing the Dashboard
1. Log in to the admin panel at `/admin/login`
2. Look for "Analytics" in the sidebar (marked with "Owner" badge)
3. Click to navigate to `/admin/analytics`

## Dashboard Sections

### 1. Today's Metrics
- **Emails Processed Today**: Count of emails processed in the last 24 hours
- **Properties Imported Today**: Total properties extracted and created today
- **Today's GPT Cost**: Total API costs incurred today
- **Cost Per Property Today**: Average cost per property for today

### 2. This Month's Metrics
- **Emails This Month**: Total emails processed since start of month
- **Properties This Month**: Total properties created this month
- **Monthly GPT Cost**: Total API spending this month
- **Avg Cost Per Property**: Monthly average cost per property

### 3. All Time Metrics
- **Total Emails Processed**: Lifetime email processing count
- **Total Properties**: All properties ever imported
- **Total GPT Spend**: Lifetime API costs
- **Lifetime Cost Per Property**: Overall average cost

### 4. Cost Breakdown Table
- Detailed daily breakdown for the last 30 days
- Shows tokens (input/output/total), costs, and per-property metrics
- Sortable columns with totals row

### 5. Profitability Calculator
Interactive tool to model different pricing strategies:

#### Usage-Based Pricing
- Set price per property (e.g., $0.05)
- See projected revenue, costs, and profit margins
- Instant calculations based on current usage

#### Subscription Tier Pricing
- Model 3 tiers: Starter, Pro, Enterprise
- Set prices and property limits per tier
- Input number of tenants per tier
- See total revenue and profit projections

#### Key Metrics
- **Current Cost Per Property**: Actual cost from data
- **Suggested Minimum Price**: 3x cost for healthy margins
- **Breakeven Properties/Month**: How many properties needed to cover costs

### 6. System Health Metrics
Quality and performance monitoring:

- **Avg Confidence Score**: Overall extraction quality (target: >80%)
- **Low Confidence Rate**: Percentage needing review (target: <10%)
- **Image Match Rate**: Success rate of image matching (target: >70%)
- **Error Rate**: Failed/partial imports (target: <5%)

Visual quality distribution shows breakdown by confidence level.

### 7. Email Platform Analytics
Performance breakdown by email platform:

- Shows which platforms (Mailchimp, Constant Contact, etc.) are processed
- Metrics: email count, properties extracted, avg confidence, image match rate
- Color-coded quality indicators

### 8. Export & Reporting
Planned features for exporting data:
- Cost reports for analysis
- Accounting-friendly formats
- Tenant-level breakdowns (for multi-tenant future)

## Database Tables

### `import_logs`
Tracks each email processing run:
```sql
- id (uuid)
- tenant_id (uuid, nullable)
- email_subject (text)
- email_from (text)
- email_platform_detected (enum)
- properties_extracted (integer)
- properties_created (integer)
- gpt_input_tokens (integer)
- gpt_output_tokens (integer)
- gpt_total_tokens (integer)
- gpt_cost_usd (numeric)
- avg_confidence_score (numeric)
- image_match_rate (numeric)
- status (enum: success, partial, failed)
- error_message (text)
- processing_time_ms (integer)
- created_at (timestamptz)
- created_by (uuid)
```

### `property_extraction_logs`
Per-property extraction details:
```sql
- id (uuid)
- import_log_id (uuid, FK to import_logs)
- property_id (uuid, FK to properties)
- street_address (text)
- city, state, zip_code (text)
- asking_price, arv (numeric)
- property_type (text)
- confidence_address (numeric 0-1)
- confidence_price (numeric 0-1)
- confidence_arv (numeric 0-1)
- confidence_property_type (numeric 0-1)
- overall_confidence (numeric 0-1)
- image_url (text)
- image_matched (boolean)
- needs_manual_review (boolean)
- was_corrected (boolean)
- correction_notes (text)
- created_at (timestamptz)
```

### `cost_summary`
Pre-aggregated metrics for faster loading:
```sql
- id (uuid)
- period_type (text: 'daily', 'monthly', 'yearly')
- period_start, period_end (timestamptz)
- tenant_id (uuid, nullable)
- total_emails (integer)
- total_properties (integer)
- total_input_tokens, total_output_tokens, total_tokens (bigint)
- total_cost_usd (numeric)
- avg_cost_per_property (numeric)
- avg_confidence_score (numeric)
- error_count (integer)
- created_at, updated_at (timestamptz)
```

## Populating Sample Data

To test the dashboard, you can insert sample data:

```sql
-- Insert sample import logs
INSERT INTO import_logs (
  email_subject,
  email_from,
  email_platform_detected,
  properties_extracted,
  properties_created,
  gpt_input_tokens,
  gpt_output_tokens,
  gpt_total_tokens,
  gpt_cost_usd,
  avg_confidence_score,
  image_match_rate,
  status,
  created_at
) VALUES
  ('New Properties - Week 1', 'sender@example.com', 'Mailchimp', 5, 5, 2500, 1500, 4000, 0.12, 0.85, 0.80, 'success', NOW() - INTERVAL '5 days'),
  ('Hot Deals This Week', 'wholesaler@example.com', 'Constant Contact', 8, 7, 4000, 2000, 6000, 0.18, 0.78, 0.71, 'success', NOW() - INTERVAL '3 days'),
  ('Weekly Inventory Update', 'deals@example.com', 'SendGrid', 12, 11, 6000, 3000, 9000, 0.27, 0.92, 0.82, 'success', NOW() - INTERVAL '1 day'),
  ('New Listings', 'properties@example.com', 'Generic', 3, 2, 1500, 800, 2300, 0.07, 0.65, 0.50, 'partial', NOW());

-- Insert sample extraction logs for one import
INSERT INTO property_extraction_logs (
  import_log_id,
  street_address,
  city,
  state,
  zip_code,
  asking_price,
  arv,
  property_type,
  confidence_address,
  confidence_price,
  confidence_arv,
  confidence_property_type,
  overall_confidence,
  image_matched,
  needs_manual_review,
  created_at
) SELECT
  id,
  '123 Main St',
  'Atlanta',
  'GA',
  '30301',
  85000,
  120000,
  'SFR',
  0.95,
  0.90,
  0.85,
  0.88,
  0.90,
  true,
  false,
  NOW()
FROM import_logs
LIMIT 1;
```

## Usage Tips

### Monitoring Costs
1. Check "Today's GPT Cost" daily to stay within budget
2. Set alerts if daily costs exceed threshold (future feature)
3. Review "Cost Breakdown Table" weekly to spot trends

### Optimizing Profitability
1. Use the calculator to model different pricing strategies
2. Target at least 3x markup over actual costs
3. Consider subscription tiers for predictable revenue

### Improving Quality
1. Monitor confidence scores - aim for >80% average
2. Investigate platforms with low image match rates
3. Review low-confidence extractions manually

### Future Multi-Tenant Planning
1. All tables support `tenant_id` for future expansion
2. Analytics will show per-tenant breakdowns
3. Identify which tenants are profitable vs costly

## Technical Notes

### Performance
- Dashboard queries are optimized with indexes
- `cost_summary` table can be used for pre-aggregation
- Consider implementing background jobs to populate `cost_summary`

### Security
- RLS policies restrict access to owner/admin roles only
- All queries filter by authenticated user role
- Audit logging recommended for access tracking

### Integration Points
When building the email import system:

1. **Create import log at start**:
```typescript
const { data: importLog } = await supabase
  .from('import_logs')
  .insert({
    email_subject: email.subject,
    email_from: email.from,
    email_platform_detected: detectPlatform(email),
  })
  .select()
  .single();
```

2. **Track token usage**:
```typescript
const response = await openai.chat.completions.create({...});
const inputTokens = response.usage.prompt_tokens;
const outputTokens = response.usage.completion_tokens;
const cost = calculateCost(inputTokens, outputTokens);
```

3. **Update import log at end**:
```typescript
await supabase
  .from('import_logs')
  .update({
    properties_extracted: properties.length,
    properties_created: createdCount,
    gpt_input_tokens: inputTokens,
    gpt_output_tokens: outputTokens,
    gpt_total_tokens: inputTokens + outputTokens,
    gpt_cost_usd: cost,
    avg_confidence_score: avgConfidence,
    image_match_rate: imageMatchRate,
    status: 'success',
  })
  .eq('id', importLog.id);
```

4. **Create extraction logs per property**:
```typescript
for (const property of extractedProperties) {
  await supabase
    .from('property_extraction_logs')
    .insert({
      import_log_id: importLog.id,
      property_id: createdProperty.id,
      street_address: property.address,
      confidence_address: property.confidences.address,
      overall_confidence: property.overallConfidence,
      image_matched: !!property.image_url,
      needs_manual_review: property.overallConfidence < 0.6,
    });
}
```

## Support

For issues or questions about the Owner Analytics Dashboard:
1. Check this documentation first
2. Review sample queries in this file
3. Verify your role is set to 'owner' in user_profiles table
4. Check browser console for errors

## Roadmap

Future enhancements planned:
- [ ] Export to CSV functionality
- [ ] Email alerts for cost thresholds
- [ ] Scheduled weekly/monthly reports
- [ ] Multi-tenant analytics and profitability tracking
- [ ] Advanced charting (line graphs, pie charts)
- [ ] Cost forecasting based on trends
- [ ] Integration with accounting software
- [ ] Custom date range selection
- [ ] Comparison tools (month-over-month, year-over-year)
