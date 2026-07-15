"use client";

import { ChevronDown } from "lucide-react";

interface Token {
  symbol: string;
  name: string;
  logo: string; // image path
}

interface Props {
  token: Token;
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  label: string;
  usdValue?: string;
  loading?: boolean;
}

export default function TokenInputBox({
  token,
  value,
  onChange,
  readOnly = false,
  label,
  usdValue,
  loading,
}: Props) {
  return (
    <div
      style={{
        background: "var(--bg-input)",
        borderRadius: "28px",
        padding: "24px 28px",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-instrument)",
          fontSize: "22px",
          color: "var(--text-primary)",
          marginBottom: "18px",
        }}
      >
        {label}
      </p>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
        {/* Amount */}
        <div style={{ minWidth: 0, flex: 1 }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", height: "56px" }}>
              <div className="spinner" style={{ width: "22px", height: "22px" }} />
            </div>
          ) : (
            <input
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              readOnly={readOnly}
              className="swap-amount-input"
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--text-primary)",
                fontFamily: "var(--font-instrument)",
                fontSize: "56px",
                lineHeight: 1,
              }}
            />
          )}
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "15px",
              marginTop: "10px",
            }}
          >
            ${usdValue ?? "0"}
          </p>
        </div>

        {/* Token pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
            borderRadius: "9999px",
            padding: "10px 18px 10px 10px",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          <img
            src={token.logo}
            alt={token.symbol}
            width={32}
            height={32}
            style={{ borderRadius: "50%", objectFit: "cover" }}
          />
          <span
            style={{
              color: "var(--text-primary)",
              fontWeight: 600,
              fontSize: "17px",
              fontFamily: "var(--font-instrument)",
            }}
          >
            {token.symbol}
          </span>
          <ChevronDown size={16} style={{ color: "var(--text-secondary)" }} />
        </div>
      </div>
    </div>
  );
}
