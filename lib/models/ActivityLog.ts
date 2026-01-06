// lib/models/ActivityLog.ts
import mongoose from "mongoose";

const ActivityLogSchema = new mongoose.Schema(
  {
    /* =====================
       👤 ผู้ใช้งาน
    ===================== */
    userExamCode: {
      type: String,
      index: true,
    },
    userName: String,

    sessionId: {
      type: String,
      index: true,
    },

    /* =====================
       🧭 การกระทำ
    ===================== */
    action: {
      type: String,
      required: true,
      index: true,
      // PAGE_VIEW
      // ROUTE_CHANGE
      // TAB_HIDDEN
      // LEAVE_SITE
      // INVALID_ACCESS
    },

    severity: {
      type: String,
      enum: ["info", "warning", "danger"],
      default: "info",
      index: true,
    },

    isSuspicious: {
      type: Boolean,
      default: false,
      index: true,
    },

    /* =====================
       📍 ตำแหน่ง
    ===================== */
    page: String,   // หน้า ณ ขณะนั้น
    from: String,   // มาจากหน้า
    to: String,     // ไปหน้า

    /* =====================
       🧠 ข้อมูลเสริม
    ===================== */
    meta: {
      type: mongoose.Schema.Types.Mixed,
    },

    /* =====================
       🌐 environment
    ===================== */
    userAgent: String,
    ip: String,
    referrer: String,
  },
  {
    timestamps: true,
  }
);

/* =====================
   Index เพิ่มเติม
===================== */
ActivityLogSchema.index({ createdAt: -1 });
ActivityLogSchema.index({ action: 1, createdAt: -1 });

export const ActivityLog =
  mongoose.models.ActivityLog ||
  mongoose.model("ActivityLog", ActivityLogSchema);