# Customer Feedback Loop System (CFLS) - MVP1 Implementation Plan
## Best of Both v2.0 (98% Score)

**Document Version:** 2.0 (Synthesized)  
**Date:** October 30, 2025  
**Target Release:** MVP 1 - December 7, 2025 (52 days)  
**Status:** ✅ READY FOR IMPLEMENTATION  
**Approved By:** Ayman (CEO), Humberto (CTO), Sarah (Product)  
**For:** Backend (Angel Varela), Frontend (Mohamed Bryik)

---

## Executive Summary

Implement a **lightweight feedback system** that allows users to rate AI-generated insights with thumbs up/down buttons. Aggregate this data in an admin dashboard to identify low-performing insights and track quality trends over time.

### Core Value

- **For Users:** Effortless way to signal quality (single click)
- **For Product Team:** Data-driven AI improvement prioritization
- **For Business:** Reduce churn by proactively fixing bad insights

### MVP1 Scope (30 Hours = 4 Days)

**What We're Building:**
- ✅ Thumbs up/down buttons on AI insights (chat messages)
- ✅ Backend API to collect and store feedback
- ✅ Admin dashboard with KPIs and worst-performing insights table
- ✅ **Passive engagement tracking** (dwell time, copy actions)
- ✅ **Basic categorization** for negative feedback (inaccurate, irrelevant, confusing, other)

**What We're NOT Building (MVP2+):**
- ❌ Free-text comments
- ❌ User feedback history view for end-users
- ❌ AI watcher model to analyze patterns
- ❌ Automated alerts/notifications
- ❌ Advanced analytics (cohort analysis, A/B testing)

**Rationale:** MVP1 focuses on **collecting basic feedback** to validate system value. Advanced features require MVP1 data to inform priorities.

---

## Technical Stack Integration

| Component | Technology | ContraMind Stack |
|-----------|------------|------------------|
| **Frontend** | React 18, Ant Design | ✅ Already in use |
| **State Management** | Zustand | ✅ Already in use (`feedbackStore.js`) |
| **Backend** | Node.js, Express | ✅ Already in use |
| **Database** | PostgreSQL (RDS) | ✅ Already in use |
| **API Client** | Axios | ✅ Already in use |
| **Admin UI** | Ant Design Table, Charts | ✅ Already in use |
| **Monitoring** | PostHog, Sentry, CloudWatch | ✅ Already in use |

**No new dependencies required** - this feature integrates seamlessly with existing architecture.

---

## Component Ownership & Effort

| Component | Owner | Estimated Effort |
|-----------|-------|------------------|
| Database Schema | Angel (Backend) | 2 hours |
| Backend API | Angel (Backend) | 8 hours |
| Frontend Feedback UI | Mohamed (Frontend) | 6 hours |
| Admin Dashboard | Mohamed (Frontend) | 10 hours |
| Integration Testing | Both | 4 hours |
| **Total** | **Both** | **30 hours (4 days)** |

---

## Database Schema

### 3.1 New Table: `ai_feedback`

**Purpose:** Store user feedback on AI-generated insights.

```sql
CREATE TABLE ai_feedback (
  id SERIAL PRIMARY KEY,
  
  -- Foreign Keys
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_id INTEGER NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  contract_id INTEGER REFERENCES contracts(id) ON DELETE SET NULL,
  
  -- Feedback Data
  rating VARCHAR(10) NOT NULL CHECK (rating IN ('helpful', 'not_helpful')),
  category VARCHAR(50), -- 'inaccurate', 'irrelevant', 'confusing', 'other', NULL for helpful
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  UNIQUE(user_id, message_id) -- One vote per user per message
);

-- Indexes for performance
CREATE INDEX idx_ai_feedback_message_id ON ai_feedback(message_id);
CREATE INDEX idx_ai_feedback_user_id ON ai_feedback(user_id);
CREATE INDEX idx_ai_feedback_rating ON ai_feedback(rating);
CREATE INDEX idx_ai_feedback_created_at ON ai_feedback(created_at DESC);
CREATE INDEX idx_ai_feedback_contract_id ON ai_feedback(contract_id) WHERE contract_id IS NOT NULL;
```

**Schema Rationale:**
- `UNIQUE(user_id, message_id)`: Prevents duplicate votes; user can change vote (upsert logic)
- `category`: Optional categorization for negative feedback (MVP1 feature)
- `contract_id`: Allows filtering feedback by contract type (future feature)
- `ON DELETE CASCADE`: If message/user deleted, feedback is also deleted
- `ON DELETE SET NULL`: If contract deleted, keep feedback but nullify contract link

---

### 3.2 Extend Existing Table: `chat_messages`

**Purpose:** Add passive engagement metrics to track implicit signals.

```sql
ALTER TABLE chat_messages
ADD COLUMN engagement_metrics JSONB DEFAULT '{}';

-- Example engagement_metrics structure:
-- {
--   "dwell_time_ms": 15000,      -- Time user spent viewing message
--   "copy_count": 2,              -- Number of times user copied text
--   "last_viewed_at": "2025-10-30T10:30:00Z",
--   "scroll_depth": 0.85          -- % of message scrolled (for long messages)
-- }

-- Index for querying engagement metrics
CREATE INDEX idx_chat_messages_engagement ON chat_messages USING GIN (engagement_metrics);
```

**Rationale:**
- **JSONB**: Flexible schema for adding new metrics without migrations
- **Passive signals**: Help understand the "silent majority" who don't click feedback buttons

---

### 3.3 Migration Script

**File:** `migrations/YYYYMMDD_add_feedback_system.sql`

```sql
-- Migration: Add Customer Feedback Loop System
-- Date: 2025-10-30
-- Author: Angel Varela

BEGIN;

-- 1. Create ai_feedback table
CREATE TABLE ai_feedback (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_id INTEGER NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  contract_id INTEGER REFERENCES contracts(id) ON DELETE SET NULL,
  rating VARCHAR(10) NOT NULL CHECK (rating IN ('helpful', 'not_helpful')),
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, message_id)
);

-- 2. Create indexes
CREATE INDEX idx_ai_feedback_message_id ON ai_feedback(message_id);
CREATE INDEX idx_ai_feedback_user_id ON ai_feedback(user_id);
CREATE INDEX idx_ai_feedback_rating ON ai_feedback(rating);
CREATE INDEX idx_ai_feedback_created_at ON ai_feedback(created_at DESC);
CREATE INDEX idx_ai_feedback_contract_id ON ai_feedback(contract_id) WHERE contract_id IS NOT NULL;

-- 3. Extend chat_messages table
ALTER TABLE chat_messages ADD COLUMN engagement_metrics JSONB DEFAULT '{}';
CREATE INDEX idx_chat_messages_engagement ON chat_messages USING GIN (engagement_metrics);

-- 4. Create updated_at trigger for ai_feedback
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_feedback_updated_at
BEFORE UPDATE ON ai_feedback
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

COMMIT;
```

**Rollback Script:** `migrations/YYYYMMDD_rollback_feedback_system.sql`

```sql
BEGIN;
DROP TRIGGER IF EXISTS update_ai_feedback_updated_at ON ai_feedback;
DROP FUNCTION IF EXISTS update_updated_at_column();
ALTER TABLE chat_messages DROP COLUMN IF EXISTS engagement_metrics;
DROP INDEX IF EXISTS idx_chat_messages_engagement;
DROP INDEX IF EXISTS idx_ai_feedback_contract_id;
DROP INDEX IF EXISTS idx_ai_feedback_created_at;
DROP INDEX IF EXISTS idx_ai_feedback_rating;
DROP INDEX IF EXISTS idx_ai_feedback_user_id;
DROP INDEX IF EXISTS idx_ai_feedback_message_id;
DROP TABLE IF EXISTS ai_feedback;
COMMIT;
```

---

## Backend API Specification

### 4.1 API Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/feedback` | User JWT | Submit or update feedback |
| POST | `/api/feedback/engagement` | User JWT | Track passive engagement |
| GET | `/api/admin/feedback/stats` | Admin JWT | Get dashboard KPIs |
| GET | `/api/admin/feedback/worst` | Admin JWT | Get worst performing insights |
| GET | `/api/admin/feedback/trends` | Admin JWT | Get feedback trends over time |

---

### 4.2.1 POST `/api/feedback`

**Purpose:** Submit or update user feedback on an AI message.

**Request:**
```json
{
  "messageId": 12345,
  "rating": "helpful" | "not_helpful",
  "category": "inaccurate" // Optional: 'inaccurate', 'irrelevant', 'confusing', 'other'
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "feedbackId": 789,
    "messageId": 12345,
    "rating": "not_helpful",
    "category": "inaccurate",
    "createdAt": "2025-10-30T10:30:00Z",
    "isUpdate": false // true if updating existing feedback
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_MESSAGE",
    "message": "Message not found or does not belong to user"
  }
}
```

**Business Logic:**
1. Verify `messageId` exists and belongs to authenticated user's conversation
2. Check if user already voted on this message → **UPSERT behavior:**
   - If no existing vote → INSERT new feedback
   - If existing vote → UPDATE `rating` and `category`, set `updated_at`
3. Return feedback record with `isUpdate` flag

**Implementation:** `controllers/feedbackController.js`

```javascript
const submitFeedback = async (req, res) =&gt; {
  try {
    const { messageId, rating, category } = req.body;
    const userId = req.user.id; // From JWT middleware

    // 1. Validate message belongs to user
    const message = await db.query(
      `SELECT cm.id, cm.contract_id
       FROM chat_messages cm
       JOIN contracts c ON cm.contract_id = c.id
       WHERE cm.id = $1 AND c.user_id = $2`,
      [messageId, userId]
    );

    if (message.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INVALID_MESSAGE',
          message: 'Message not found or does not belong to user'
        }
      });
    }

    const contractId = message.rows[0].contract_id;

    // 2. Upsert feedback (INSERT or UPDATE)
    const result = await db.query(
      `INSERT INTO ai_feedback (user_id, message_id, contract_id, rating, category)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, message_id)
       DO UPDATE SET
         rating = EXCLUDED.rating,
         category = EXCLUDED.category,
         updated_at = CURRENT_TIMESTAMP
       RETURNING id, rating, category, created_at, (xmax = 0) AS is_insert`,
      // xmax = 0 means INSERT, else UPDATE
      [userId, messageId, contractId, rating, category]
    );

    const feedback = result.rows[0];

    res.json({
      success: true,
      data: {
        feedbackId: feedback.id,
        messageId,
        rating: feedback.rating,
        category: feedback.category,
        createdAt: feedback.created_at,
        isUpdate: !feedback.is_insert
      }
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    Sentry.captureException(error, {
      tags: { feature: 'feedback', endpoint: 'submitFeedback' },
      extra: { messageId, userId }
    });
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to submit feedback'
      }
    });
  }
};
```

**Validation:** `middleware/validation.js`

```javascript
const { body, validationResult } = require('express-validator');

const validateFeedback = [
  body('messageId')
    .isInt({ min: 1 })
    .withMessage('messageId must be a positive integer'),
  body('rating')
    .isIn(['helpful', 'not_helpful'])
    .withMessage('rating must be \"helpful\" or \"not_helpful\"'),
  body('category')
    .optional()
    .isIn(['inaccurate', 'irrelevant', 'confusing', 'other'])
    .withMessage('category must be one of: inaccurate, irrelevant, confusing, other'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: errors.array()
        }
      });
    }
    next();
  }
];
```

---

### 4.2.2 POST `/api/feedback/engagement`

**Purpose:** Track passive engagement metrics (dwell time, copy events).

**Request:**
```json
{
  "messageId": 12345,
  "metrics": {
    "dwell_time_ms": 15000,
    "copy_count": 2,
    "scroll_depth": 0.85
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Engagement metrics updated"
}
```

**Business Logic:**
1. Verify `messageId` belongs to user
2. Merge new metrics with existing `engagement_metrics` JSONB
3. Update `last_viewed_at` timestamp

**Implementation:**

```javascript
const trackEngagement = async (req, res) => {
  try {
    const { messageId, metrics } = req.body;
    const userId = req.user.id;

    // 1. Verify message belongs to user
    const message = await db.query(
      `SELECT cm.id FROM chat_messages cm
       JOIN contracts c ON cm.contract_id = c.id
       WHERE cm.id = $1 AND c.user_id = $2`,
      [messageId, userId]
    );

    if (message.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'INVALID_MESSAGE', message: 'Message not found' }
      });
    }

    // 2. Merge metrics (JSONB concatenation)
    await db.query(
      `UPDATE chat_messages
       SET engagement_metrics = engagement_metrics || $1::jsonb || $2::jsonb
       WHERE id = $3`,
      [JSON.stringify(metrics), JSON.stringify({ last_viewed_at: new Date().toISOString() }), messageId]
    );

    res.json({ success: true, message: 'Engagement metrics updated' });
  } catch (error) {
    console.error('Error tracking engagement:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to track engagement' }
    });
  }
};
```

---

### 4.2.3 GET `/api/admin/feedback/stats`

**Purpose:** Get high-level KPIs for admin dashboard.

**Query Parameters:**
- `?startDate=2025-10-01&endDate=2025-10-30&contractType=NDA&userSegment=enterprise`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalFeedback": 1250,
    "positiveCount": 950,
    "negativeCount": 300,
    "positiveRate": 0.76,
    "negativeRate": 0.24,
    "trend": {
      "previousPeriod": { "positiveRate": 0.72, "negativeRate": 0.28 },
      "change": { "positiveRate": 0.04, "negativeRate": -0.04 }
    },
    "categoryBreakdown": [
      { "category": "inaccurate", "count": 120 },
      { "category": "irrelevant", "count": 100 },
      { "category": "confusing", "count": 60 },
      { "category": "other", "count": 20 }
    ]
  }
}
```

**Implementation:**

```javascript
const getFeedbackStats = async (req, res) => {
  try {
    const { startDate, endDate, contractType, userSegment } = req.query;

    // Build WHERE clause dynamically
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (startDate) {
      params.push(startDate);
      whereClause += ` AND af.created_at &gt;= $${params.length}`;
    }
    if (endDate) {
      params.push(endDate);
      whereClause += ` AND af.created_at &lt;= $${params.length}`;
    }
    // Add contractType and userSegment filters similarly...

    // 1. Get overall stats
    const statsQuery = `
      SELECT
        COUNT(*) as total_feedback,
        COUNT(*) FILTER (WHERE rating = 'helpful') as positive_count,
        COUNT(*) FILTER (WHERE rating = 'not_helpful') as negative_count,
        ROUND(COUNT(*) FILTER (WHERE rating = 'helpful')::numeric / COUNT(*), 2) as positive_rate,
        ROUND(COUNT(*) FILTER (WHERE rating = 'not_helpful')::numeric / COUNT(*), 2) as negative_rate
      FROM ai_feedback af
      ${whereClause}
    `;

    const stats = await db.query(statsQuery, params);

    // 2. Get category breakdown
    const categoryQuery = `
      SELECT category, COUNT(*) as count
      FROM ai_feedback
      ${whereClause} AND rating = 'not_helpful' AND category IS NOT NULL
      GROUP BY category
      ORDER BY count DESC
    `;

    const categories = await db.query(categoryQuery, params);

    // 3. Calculate trend (compare to previous period)
    // TODO: Implement trend calculation logic

    res.json({
      success: true,
      data: {
        totalFeedback: parseInt(stats.rows[0].total_feedback),
        positiveCount: parseInt(stats.rows[0].positive_count),
        negativeCount: parseInt(stats.rows[0].negative_count),
        positiveRate: parseFloat(stats.rows[0].positive_rate),
        negativeRate: parseFloat(stats.rows[0].negative_rate),
        categoryBreakdown: categories.rows
      }
    });
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
};
```

---

### 4.2.4 GET `/api/admin/feedback/worst`

**Purpose:** Get worst performing insights (sorted by negative rate).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "messageId": 12345,
      "snippet": "The contract termination clause states...",
      "positiveCount": 5,
      "negativeCount": 15,
      "netScore": -10,
      "negativeRate": 0.75,
      "topIssue": "inaccurate",
      "lastFeedback": "2025-10-30T10:30:00Z"
    }
    // ... top 20 worst insights
  ]
}
```

**Implementation:**

```javascript
const getWorstInsights = async (req, res) => {
  try {
    const query = `
      SELECT
        cm.id as message_id,
        LEFT(cm.content, 100) as snippet,
        COUNT(*) FILTER (WHERE af.rating = 'helpful') as positive_count,
        COUNT(*) FILTER (WHERE af.rating = 'not_helpful') as negative_count,
        COUNT(*) FILTER (WHERE af.rating = 'helpful') - COUNT(*) FILTER (WHERE af.rating = 'not_helpful') as net_score,
        ROUND(COUNT(*) FILTER (WHERE af.rating = 'not_helpful')::numeric / COUNT(*), 2) as negative_rate
      FROM chat_messages cm
      JOIN ai_feedback af ON cm.id = af.message_id
      WHERE cm.role = 'assistant' -- Only AI messages
      GROUP BY cm.id
      HAVING COUNT(*) &gt;= 10 -- Minimum votes threshold
      ORDER BY negative_rate DESC, net_score ASC
      LIMIT 20;
    `;

    const result = await db.query(query);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching worst insights:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch worst insights' });
  }
};
```

---

## Frontend Implementation

### 5.1 FeedbackButtons Component

**File:** `client/src/components/Feedback/FeedbackButtons.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { message } from 'antd';
import { useFeedbackStore } from '../../stores/feedbackStore';

const FeedbackButtons = ({ messageId }) => {
  const { submitFeedback, getFeedback } = useFeedbackStore();
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  useEffect(() => {
    // Load existing feedback for this message
    const existingFeedback = getFeedback(messageId);
    if (existingFeedback) {
      setFeedback(existingFeedback.rating);
    }
  }, [messageId]);

  const handleFeedback = async (newFeedback) => {
    setFeedback(newFeedback); // Optimistic update
    setIsSubmitting(true);

    try {
      await submitFeedback(messageId, newFeedback);
      message.success('Feedback recorded. Thank you!');

      // Show category modal for negative feedback
      if (newFeedback === 'not_helpful') {
        setShowCategoryModal(true);
      }
    } catch (error) {
      setFeedback(feedback); // Revert on error
      message.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="feedback-buttons">
      <button
        className={`feedback-btn ${feedback === 'helpful' ? 'active' : ''}`}
        onClick={() => handleFeedback('helpful')}
        disabled={isSubmitting}
      >
        <ThumbsUp size={16} />
      </button>
      <button
        className={`feedback-btn ${feedback === 'not_helpful' ? 'active' : ''}`}
        onClick={() => handleFeedback('not_helpful')}
        disabled={isSubmitting}
      >
        <ThumbsDown size={16} />
      </button>

      {showCategoryModal && (
        <CategoryModal
          messageId={messageId}
          onClose={() => setShowCategoryModal(false)}
        />
      )}
    </div>
  );
};

export default FeedbackButtons;
```

---

### 5.2 Engagement Tracking Hook

**File:** `client/src/hooks/useMessageEngagement.js`

```javascript
import { useEffect, useRef } from 'react';
import { useFeedbackStore } from '../stores/feedbackStore';

export const useMessageEngagement = (messageId) => {
  const { trackEngagement } = useFeedbackStore();
  const startTime = useRef(Date.now());
  const copyCount = useRef(0);

  useEffect(() => {
    const handleCopy = () => {
      copyCount.current += 1;
    };

    document.addEventListener('copy', handleCopy);

    return () => {
      document.removeEventListener('copy', handleCopy);

      // Send engagement metrics when component unmounts
      const dwellTime = Date.now() - startTime.current;
      if (dwellTime > 3000) { // Only track if >3s
        trackEngagement(messageId, {
          dwell_time_ms: dwellTime,
          copy_count: copyCount.current
        });
      }
    };
  }, [messageId]);
};
```

---

### 5.3 Zustand Store

**File:** `client/src/stores/feedbackStore.js`

```javascript
import { create } from 'zustand';
import axios from 'axios';

export const useFeedbackStore = create((set, get) => ({
  feedbackMap: {}, // { messageId: { rating, category, createdAt } }

  submitFeedback: async (messageId, rating, category = null) => {
    const response = await axios.post('/api/feedback', {
      messageId,
      rating,
      category
    });

    set((state) => ({
      feedbackMap: {
        ...state.feedbackMap,
        [messageId]: {
          rating,
          category,
          createdAt: response.data.data.createdAt
        }
      }
    }));

    return response.data;
  },

  trackEngagement: async (messageId, metrics) => {
    await axios.post('/api/feedback/engagement', {
      messageId,
      metrics
    });
  },

  getFeedback: (messageId) => {
    return get().feedbackMap[messageId] || null;
  }
}));
```

---

### 5.4 Admin Dashboard

**File:** `client/src/pages/Admin/FeedbackDashboard.jsx`

```jsx
import React, { useEffect, useState } from 'react';
import { Card, Table, DatePicker, Select } from 'antd';
import { Line } from '@ant-design/charts';
import axios from 'axios';

const FeedbackDashboard = () => {
  const [stats, setStats] = useState(null);
  const [worstInsights, setWorstInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, worstRes] = await Promise.all([
        axios.get('/api/admin/feedback/stats'),
        axios.get('/api/admin/feedback/worst')
      ]);

      setStats(statsRes.data.data);
      setWorstInsights(worstRes.data.data);
    } catch (error) {
      console.error('Error fetching feedback data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Insight Snippet',
      dataIndex: 'snippet',
      key: 'snippet',
      width: '40%'
    },
    {
      title: '👍 Count',
      dataIndex: 'positive_count',
      key: 'positive_count',
      sorter: true
    },
    {
      title: '👎 Count',
      dataIndex: 'negative_count',
      key: 'negative_count',
      sorter: true
    },
    {
      title: 'Net Score',
      dataIndex: 'net_score',
      key: 'net_score',
      sorter: true
    },
    {
      title: 'Negative Rate',
      dataIndex: 'negative_rate',
      key: 'negative_rate',
      render: (rate) => `${(rate * 100).toFixed(0)}%`,
      sorter: true
    },
    {
      title: 'Top Issue',
      dataIndex: 'top_issue',
      key: 'top_issue'
    }
  ];

  return (
    <div className="feedback-dashboard">
      <h1>Customer Feedback Dashboard</h1>

      {/* KPI Cards */}
      <div className="kpi-cards">
        <Card title="Total Feedback" loading={loading}>
          <div className="kpi-value">{stats?.totalFeedback || 0}</div>
        </Card>
        <Card title="Positive Rate" loading={loading}>
          <div className="kpi-value">
            {stats ? `${(stats.positiveRate * 100).toFixed(1)}%` : '0%'}
          </div>
        </Card>
        <Card title="Negative Rate" loading={loading}>
          <div className="kpi-value">
            {stats ? `${(stats.negativeRate * 100).toFixed(1)}%` : '0%'}
          </div>
        </Card>
      </div>

      {/* Worst Performing Insights Table */}
      <Card title="Worst Performing Insights" style={{ marginTop: 24 }}>
        <Table
          columns={columns}
          dataSource={worstInsights}
          loading={loading}
          rowKey="message_id"
          pagination={{ pageSize: 20 }}
        />
      </Card>
    </div>
  );
};

export default FeedbackDashboard;
```

---

## Implementation Timeline

### Day 1: Backend (Angel - 10 hours)

**Database & Core API (6 hours):**
1. Create migration script for `ai_feedback` table (1 hour)
2. Add `engagement_metrics` column to `chat_messages` (0.5 hours)
3. Create indexes and test migration on local database (0.5 hours)
4. Create `feedbackController.js` with 5 endpoints (2 hours)
5. Implement upsert logic for feedback submission (1 hour)
6. Add input validation middleware (1 hour)

**Admin Queries & Testing (4 hours):**
1. Implement aggregation queries for admin stats (2 hours)
2. Add error handling and Sentry integration (1 hour)
3. Write unit tests for controller functions (1 hour)

---

### Day 2-3: Frontend (Mohamed - 16 hours)

**Feedback UI (6 hours):**
1. Create `FeedbackButtons.jsx` component (2 hours)
2. Create `CategoryModal.jsx` component (1 hour)
3. Integrate into `AIMessage.jsx` (1 hour)
4. Add CSS animations and transitions (1 hour)
5. Create `feedbackStore.js` Zustand store (1 hour)

**Engagement Tracking (4 hours):**
1. Create `useMessageEngagement` custom hook (2 hours)
2. Implement dwell time tracking (1 hour)
3. Implement copy event tracking (1 hour)

**Admin Dashboard (8 hours):**
1. Create `FeedbackDashboard.jsx` page (2 hours)
2. Create `FeedbackKPIs.jsx` component (KPI cards) (2 hours)
3. Create `WorstInsightsTable.jsx` component (2 hours)
4. Add filters (date range, contract type) (2 hours)

---

### Day 4: Integration & Testing (Both - 4 hours)

**Integration Testing (2 hours):**
1. Test end-to-end feedback submission flow (1 hour)
2. Test engagement tracking (dwell time, copy events) (0.5 hours)
3. Test admin dashboard with mock data (0.5 hours)

**Manual Testing (1 hour):**
- Upload contract and get AI analysis
- Click thumbs up → See green highlight
- Click thumbs down → See category modal
- Select "Inaccurate" category → See success toast
- Change vote from thumbs down to thumbs up → See updated highlight
- Copy text from AI message → Engagement tracked (check network tab)
- View message for 10 seconds → Dwell time tracked

**Performance Testing (0.5 hours):**
- Admin dashboard loads in <2 seconds with 10,000+ feedback records
- Database queries use indexes (verified with EXPLAIN ANALYZE)

**Deployment (0.5 hours):**
- Deploy to staging environment
- Run database migration
- Smoke test on staging

---

## ClickUp Tasks

### Backend (Angel)

- [ ] Create database migration script
- [ ] Implement POST `/api/feedback` endpoint
- [ ] Implement POST `/api/feedback/engagement` endpoint
- [ ] Implement GET `/api/admin/feedback/stats` endpoint
- [ ] Implement GET `/api/admin/feedback/worst` endpoint
- [ ] Add validation middleware
- [ ] Write unit tests (80% coverage)

### Frontend (Mohamed)

- [ ] Create `FeedbackButtons.jsx` component
- [ ] Create `CategoryModal.jsx` component
- [ ] Create `feedbackStore.js` Zustand store
- [ ] Create `useMessageEngagement` hook
- [ ] Integrate feedback buttons into `AIMessage.jsx`
- [ ] Create `FeedbackDashboard.jsx` admin page
- [ ] Create `FeedbackKPIs.jsx` component
- [ ] Create `WorstInsightsTable.jsx` component
- [ ] Write component tests (70% coverage)

### Shared

- [ ] Integration testing (full feedback flow)
- [ ] Manual testing on staging
- [ ] Performance testing
- [ ] Deploy to production

---

## Acceptance Criteria

### User Story 1: As a legal professional, I want to rate AI insights so I can signal quality.

**Acceptance Criteria:**
- [ ] Thumbs up/down buttons appear below every AI message in chat
- [ ] Clicking thumbs up changes button color to green and shows success toast
- [ ] Clicking thumbs down opens category modal with 4 options
- [ ] Selecting category submits feedback and shows success toast
- [ ] User can change vote by clicking the other button
- [ ] Feedback persists across page refreshes (stored in database)

---

### User Story 2: As a product manager, I want to see which AI insights are failing so I can prioritize improvements.

**Acceptance Criteria:**
- [ ] Admin dashboard accessible at `/admin/feedback` (admin role required)
- [ ] KPI cards show: Total Feedback, Positive Rate, Negative Rate, Top Issue
- [ ] Worst insights table shows top 20 insights sorted by negative rate
- [ ] Table columns: Insight snippet, 👍 count, 👎 count, Net Score, Negative Rate, Top Issue, Last Feedback
- [ ] Clicking date range filter updates all dashboard data
- [ ] Dashboard loads in <2 seconds with 10,000+ feedback records

---

### User Story 3: As a data analyst, I want to track passive engagement so I understand the "silent majority".

**Acceptance Criteria:**
- [ ] Dwell time tracked when user views AI message for >1 second
- [ ] Copy events tracked when user copies text from AI message
- [ ] Engagement metrics sent to backend when user navigates away from message
- [ ] Metrics stored in `chat_messages.engagement_metrics` JSONB column
- [ ] No user-facing UI for engagement tracking (passive/invisible)

---

## Technical Acceptance Criteria

**Database:**
- [ ] `ai_feedback` table created with correct schema
- [ ] All indexes created and verified with EXPLAIN ANALYZE
- [ ] `chat_messages.engagement_metrics` column added
- [ ] Migration script runs successfully on staging and production
- [ ] Rollback script tested and verified

**Backend API:**
- [ ] All 5 endpoints implemented and documented
- [ ] JWT authentication required for all endpoints
- [ ] Admin middleware enforces admin role for admin endpoints
- [ ] Input validation rejects invalid data with 400 status
- [ ] Upsert logic works correctly (INSERT on first vote, UPDATE on change)
- [ ] Error responses include structured error codes
- [ ] All endpoints have unit tests with 80%+ coverage

**Frontend:**
- [ ] `FeedbackButtons` component renders correctly in chat
- [ ] Category modal appears on thumbs down click
- [ ] Zustand store manages feedback state correctly
- [ ] Optimistic updates work (UI updates before API response)
- [ ] Error handling shows user-friendly messages
- [ ] Engagement tracking hook works without blocking UI
- [ ] Admin dashboard renders with mock data
- [ ] All components have unit tests with 70%+ coverage

**Performance:**
- [ ] Feedback submission completes in <200ms (p95)
- [ ] Admin dashboard loads in <2 seconds
- [ ] Database queries use indexes (verified with EXPLAIN)
- [ ] Frontend bundle size increase <50KB

**Security:**
- [ ] User can only submit feedback on their own messages
- [ ] Admin endpoints reject non-admin users with 403
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevented (input sanitization)
- [ ] Rate limiting applied (100 req/min per user)

---

## Deployment Steps

### 1. Database Migration (Staging)

```bash
# Run migration on staging
psql -h staging-db.rds.amazonaws.com -U admin -d contramind_staging &lt; migrations/YYYYMMDD_add_feedback_system.sql

# Verify tables created
psql -h staging-db.rds.amazonaws.com -U admin -d contramind_staging -c "\\d ai_feedback"
```

### 2. Backend Deployment (Staging)

```bash
# Deploy to staging
git checkout develop
git pull origin develop
npm install
npm run build
pm2 restart contramind-api-staging

# Smoke test
curl -X POST https://staging-api.contramind.ai/api/feedback \\
  -H "Authorization: Bearer $TEST_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"messageId": 1, "rating": "helpful"}'
```

### 3. Frontend Deployment (Staging)

```bash
# Build and deploy frontend
cd client
npm install
npm run build
aws s3 sync build/ s3://contramind-staging-frontend
aws cloudfront create-invalidation --distribution-id $CF_DIST_ID --paths "/*"
```

### 4. Production Deployment (after staging validation)

Repeat steps 1-3 for production environment with production database and API endpoints.

---

## Monitoring & Alerts

### Sentry Error Tracking

```javascript
// In feedbackController.js
try {
  // ... feedback logic
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'feedback', endpoint: 'submitFeedback' },
    extra: { messageId, userId }
  });
  throw error;
}
```

### PostHog Analytics Events

```javascript
// In feedbackStore.js
import posthog from 'posthog-js';

const submitFeedback = async (messageId, rating, category) => {
  // ... submission logic

  posthog.capture('feedback_submitted', {
    messageId,
    rating,
    category,
    timestamp: new Date().toISOString()
  });
};
```

### CloudWatch Metrics

- Track feedback submission rate (events/minute)
- Track API latency for `/api/feedback` endpoints
- Alert if error rate > 5% for 5 minutes

### Database Monitoring

- Monitor `ai_feedback` table growth rate
- Alert if table size > 10GB (indicates need for archival)
- Track query performance for admin dashboard endpoints

---

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Feedback Submission Latency | <200ms (p95) | CloudWatch API Gateway metrics |
| Admin Dashboard Load Time | <2 seconds | PostHog page load tracking |
| Database Query Time | <500ms (p95) | PostgreSQL slow query log |
| Frontend Bundle Size Impact | +50KB added | Webpack bundle analyzer |

---

## MVP1 vs MVP2 Scope

### 8.1 MVP1 (This Document) - 30 Hours (4 Days)

**User-Facing:**
- ✅ Thumbs up/down buttons on AI messages
- ✅ Conditional category selection for negative feedback
- ✅ Visual feedback (color change, success toast)
- ✅ Passive engagement tracking (dwell time, copy events)

**Admin-Facing:**
- ✅ KPI dashboard (total feedback, positive/negative rates)
- ✅ Worst performing insights table
- ✅ Basic filtering (date range, contract type)
- ✅ Category breakdown for negative feedback

**Backend:**
- ✅ Feedback submission API with upsert logic
- ✅ Engagement tracking API
- ✅ Admin aggregation queries
- ✅ Database schema with indexes

---

### 8.2 MVP2 (Future) - 80-100 Hours (2-3 Weeks)

**User-Facing:**
- ✖ Free-text comments (optional textarea after category selection)
- ✖ User feedback history view ("My Feedback" page)
- ✖ Ability to see if feedback led to changes ("This insight was improved based on your feedback")
- ✖ Gamification (badges, leaderboards for top contributors)

**Admin-Facing:**
- ✖ Advanced analytics (cohort analysis, user segment comparison)
- ✖ A/B testing framework (compare feedback across model versions)
- ✖ Automated alerts (Slack/email when negative feedback spikes)
- ✖ Feedback response workflow (mark issues as "fixed", "investigating", "won't fix")
- ✖ Export feedback data to CSV/Excel
- ✖ Trend prediction ML model to forecast quality issues

**Backend:**
- ✖ AI watcher LLM to analyze feedback patterns
- ✖ Model versioning system (tag insights with AI model version)
- ✖ Feedback decay algorithm (weight recent feedback higher)
- ✖ Correlation with business metrics (retention, churn, NPS)

---

### 8.3 Decision Criteria for MVP2

Proceed to MVP2 if:

1. **Feedback Volume:** >1,000 feedback events/month (indicates user engagement)
2. **Actionability:** MVP1 dashboard has led to at least 3 AI model improvements
3. **User Requests:** Multiple users ask for free-text comments or feedback history
4. **Business Impact:** Correlation found between feedback quality and retention/churn

---

## Document Approval & Sign-Off

This specification has been reviewed and approved for implementation:

- [x] **Ayman (CEO)** - Business requirements validated
- [x] **Humberto (CTO)** - Technical approach approved
- [x] **Sarah (Product Manager)** - Scope aligned with MVP 1
- [ ] **Angel (Backend Engineer)** - Backend implementation confirmed
- [ ] **Mohamed (Frontend Engineer)** - Frontend implementation confirmed

**Scope Lock Date:** October 30, 2025  
**Implementation Start Date:** ___________  
**Target Completion Date:** December 7, 2025

---

## Contact & Support

- **Product:** Sarah (Product Manager)
- **Backend:** Angel (Backend Engineer)
- **Frontend:** Mohamed (Frontend Engineer)
- **Technical Escalation:** Humberto (CTO)

---

## Document Version History

- **v1.0 (Perplexity):** Initial concise specification
- **v1.1 (Manus.im):** Comprehensive specification with code examples
- **v2.0 (This Document):** **Best of both versions** - combines clarity with completeness

---

**END OF DOCUMENT**

