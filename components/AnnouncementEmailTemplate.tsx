import * as React from "react";

interface AnnouncementEmailTemplateProps {
  studentFirstName: string;
  announcementTitle: string;
  announcementCategory: string;
  announcementContent: string;
  authorName: string;
  postedAt: string;
  platformUrl: string;
}

export function AnnouncementEmailTemplate({
  studentFirstName,
  announcementTitle,
  announcementCategory,
  announcementContent,
  authorName,
  postedAt,
  platformUrl,
}: AnnouncementEmailTemplateProps) {
  const categoryColors: Record<string, string> = {
    General: "#3b82f6",
    Academic: "#8b5cf6",
    Events: "#10b981",
    Emergency: "#ef4444",
    Welfare: "#f59e0b",
    Other: "#6b7280",
  };

  const color = categoryColors[announcementCategory] ?? "#10b981";

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', Arial, sans-serif",
        backgroundColor: "#0f0f13",
        minHeight: "100vh",
        padding: "40px 16px",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          backgroundColor: "#18181b",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid #27272a",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: `linear-gradient(135deg, ${color}22, ${color}11)`,
            borderBottom: `1px solid ${color}33`,
            padding: "32px 36px 28px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              📢
            </div>
            <div>
              <p
                style={{
                  color: "#a1a1aa",
                  fontSize: "11px",
                  margin: 0,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                SWIS Platform · New Announcement
              </p>
            </div>
          </div>
          <h1
            style={{
              color: "#ffffff",
              fontSize: "22px",
              fontWeight: 700,
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {announcementTitle}
          </h1>
          <div style={{ marginTop: "12px" }}>
            <span
              style={{
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: "20px",
                backgroundColor: `${color}20`,
                border: `1px solid ${color}40`,
                color: color,
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {announcementCategory}
            </span>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "32px 36px" }}>
          <p
            style={{
              color: "#a1a1aa",
              fontSize: "15px",
              margin: "0 0 24px 0",
              lineHeight: 1.6,
            }}
          >
            Hi <strong style={{ color: "#ffffff" }}>{studentFirstName}</strong>,
          </p>
          <p
            style={{
              color: "#a1a1aa",
              fontSize: "15px",
              margin: "0 0 20px 0",
              lineHeight: 1.6,
            }}
          >
            A new announcement has been posted on the SWIS Student Welfare
            Information System:
          </p>

          {/* Announcement content block */}
          <div
            style={{
              backgroundColor: "#09090b",
              border: "1px solid #27272a",
              borderLeft: `3px solid ${color}`,
              borderRadius: "10px",
              padding: "20px 24px",
              margin: "0 0 28px 0",
            }}
          >
            <p
              style={{
                color: "#d4d4d8",
                fontSize: "14px",
                lineHeight: 1.75,
                margin: 0,
                whiteSpace: "pre-line",
              }}
            >
              {announcementContent}
            </p>
          </div>

          {/* Meta */}
          <div style={{ display: "flex", gap: "24px", marginBottom: "28px" }}>
            <div>
              <p
                style={{
                  color: "#52525b",
                  fontSize: "11px",
                  margin: "0 0 3px 0",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Posted by
              </p>
              <p
                style={{
                  color: "#a1a1aa",
                  fontSize: "13px",
                  margin: 0,
                  fontWeight: 500,
                }}
              >
                {authorName}
              </p>
            </div>
            <div>
              <p
                style={{
                  color: "#52525b",
                  fontSize: "11px",
                  margin: "0 0 3px 0",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Date
              </p>
              <p
                style={{
                  color: "#a1a1aa",
                  fontSize: "13px",
                  margin: 0,
                  fontWeight: 500,
                }}
              >
                {postedAt}
              </p>
            </div>
          </div>

          {/* CTA */}
          <a
            href={`${platformUrl}/announcements`}
            style={{
              display: "inline-block",
              backgroundColor: color,
              color: "#ffffff",
              padding: "12px 28px",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "14px",
              letterSpacing: "0.02em",
            }}
          >
            View All Announcements →
          </a>
        </div>

        {/* Footer */}
        <div
          style={{
            backgroundColor: "#09090b",
            borderTop: "1px solid #27272a",
            padding: "20px 36px",
          }}
        >
          <p
            style={{
              color: "#52525b",
              fontSize: "12px",
              margin: 0,
              lineHeight: 1.7,
            }}
          >
            You received this email because you are a registered student on the
            SWIS platform. Log in to{" "}
            <a
              href={platformUrl}
              style={{ color: "#10b981", textDecoration: "none" }}
            >
              {platformUrl}
            </a>{" "}
            to manage your account.
          </p>
        </div>
      </div>
    </div>
  );
}
