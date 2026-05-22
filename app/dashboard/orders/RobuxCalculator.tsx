"use client"

import { useState } from "react"

export default function RobuxCalculator() {
  const [amount, setAmount] = useState(0)

  // amount = net Robux you want to receive
  // reverse calculation: gross = amount / 0.7
  const total = amount > 0 ? Math.ceil(amount / 0.7) : 0
  const fee = amount > 0 ? Math.ceil(total - amount) : 0

  return (
    <div className="space-y-4">

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Enter Robux You Want to Receive
        </label>

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full rounded-md border px-3 py-2 text-sm"
          placeholder="e.g. 200"
        />
      </div>

      <div className="rounded-md border p-3 text-sm space-y-1">

        <p>
          Desired Amount (After Fee): <b>{amount}</b> Robux
        </p>

        <p>
          Roblox Fee (30%): <b>{fee}</b> Robux
        </p>

        <p className="text-primary font-bold">
          You Must Charge: <b>{total}</b> Robux
        </p>

      </div>

    </div>
  )
}