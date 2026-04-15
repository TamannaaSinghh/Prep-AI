# 🎨 Learnify Design System (Interview Prep AI Dashboard)

A clean, modern, and soft UI design system inspired by the provided dashboard screens. This system focuses on **clarity, progress tracking, and calm learning experience** — ideal for your Interview Prep AI platform.

---

## 🧩 1. Design Philosophy

* **Minimal + Soft UI**
* Focus on **progress & motivation**
* Friendly and **non-intimidating learning environment**
* Strong use of **cards, spacing, and subtle shadows**
* Primary emphasis on **usability + hierarchy**

---

## 🎨 2. Color System

### Primary Colors

```css
Primary Purple:      #6C4CF1
Primary Gradient:    linear-gradient(135deg, #6C4CF1, #9F7AEA)
```

### Secondary Colors

```css
Light Purple BG:     #F3F0FF
Accent Purple Soft:  #E9E4FF
```

### Neutral Colors

```css
Background:          #F8F9FC
Card Background:     #FFFFFF
Border:              #E5E7EB
Text Primary:        #1F2937
Text Secondary:      #6B7280
```

### Status Colors

```css
Success:             #22C55E
Warning:             #F59E0B
Error:               #EF4444
Info:                #3B82F6
```

---

## 🔤 3. Typography

### Font Family

```css
Primary Font: "Inter", sans-serif
```

### Font Scale

```css
Heading XL:  28px / Bold
Heading L:   22px / SemiBold
Heading M:   18px / SemiBold
Body:        14px / Regular
Caption:     12px / Medium
```

### Usage Rules

* Headings → Bold / SemiBold
* Body → Regular
* Use **gray tones for secondary info**

---

## 📦 4. Layout System

### Grid

* **12-column layout**
* Max width: `1200px - 1400px`
* Spacing unit: `8px system`

### Spacing Scale

```css
4px, 8px, 12px, 16px, 24px, 32px, 48px
```

### Layout Structure

```
Sidebar (fixed)
Top Navbar
Main Content Area (cards + sections)
```

---

## 🧱 5. Core Components

### 🟣 Sidebar

* Light background with **active pill highlight**
* Icons + labels
* Rounded active state

```css
Active BG: #E9E4FF
Text Active: #6C4CF1
```

---

### 🔍 Top Navbar

* Search bar (rounded, soft border)
* Icons: notifications, profile
* Minimal shadow

---

### 📊 Cards (Core UI Element)

Used everywhere → Courses, progress, deadlines

```css
Background: #FFFFFF
Border Radius: 16px
Shadow: 0 4px 20px rgba(0,0,0,0.05)
Padding: 16px–24px
```

---

### 📈 Progress Bar

```css
Height: 6px
BG: #E5E7EB
Fill: #6C4CF1
Border Radius: 999px
```

---

### 🔘 Buttons

#### Primary Button

```css
BG: #6C4CF1
Text: #FFFFFF
Radius: 10px
Padding: 10px 18px
```

#### Secondary Button

```css
Border: 1px solid #D1D5DB
BG: transparent
Text: #6C4CF1
```

---

### 🗂 Course Card

* Thumbnail (illustration style)
* Title + rating
* Meta info (duration, users)
* Progress bar
* CTA buttons (Resume / Roadmap)

---

### 📅 Table (Deadlines)

* Soft borders
* Status pills

```css
Status Pill:
BG: #FEE2E2 (error)
Text: #EF4444
Radius: 999px
Padding: 4px 10px
```

---

## 🎯 6. Interaction Patterns

* Hover → Slight elevation + shadow
* Buttons → Subtle scale (1.02)
* Cards → Lift on hover
* Smooth transitions (`0.2s ease-in-out`)

---

## 🧠 7. UX Patterns Used

* **Progress tracking (streaks, bars)**
* **Clear CTA (Resume learning)**
* **Chunked information (cards)**
* **Visual hierarchy via spacing**
* **Motivation triggers (goals, streaks)**

---

## 👤 8. Persona Integration (From Screens)

User Type: Beginner Learner

### Pain Points

* Overwhelmed by content
* Lack of direction
* Low motivation

### Design Solutions

* Progress tracking UI
* Clear next step (Resume button)
* Simplified navigation
* Visual feedback (status, streaks)

---

## 🧩 9. Illustrations & Media

* Flat + minimal illustrations
* Soft gradients
* Friendly visuals (no harsh contrast)

---

## 🌗 10. Theme Support (Optional)

### Light Mode (default)

* White cards
* Soft gray background

### Dark Mode (optional)

* Background: #0F172A
* Card: #1E293B
* Text: #E5E7EB

---

## ⚙️ 11. Tailwind Mapping (Quick Setup)

```js
colors: {
  primary: "#6C4CF1",
  primaryLight: "#E9E4FF",
  background: "#F8F9FC",
  textPrimary: "#1F2937",
  textSecondary: "#6B7280"
},
borderRadius: {
  xl: "16px"
}
```

---

## 🚀 12. Key Takeaways for Your Interview Prep AI

* Focus on **"Continue Learning" section**
* Always show **next action**
* Keep UI **clean, soft, distraction-free**
* Use **cards + progress indicators everywhere**
* Prioritize **clarity over complexity**

---

✅ This design system is **ready to replicate** in React + Tailwind and aligns perfectly with a **learning + AI dashboard product**.

---

If you want, I can next:

* Convert this into **Tailwind components**
* Or build a **complete React dashboard UI code** for you 🚀
