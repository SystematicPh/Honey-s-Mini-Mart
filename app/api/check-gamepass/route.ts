async function checkGamepass() {
  if (!gamepassId) return

  setCheckingGamepass(true)

  try {
    const response = await fetch(
      `https://billowing-sky-14c1.macheterbx.workers.dev/?id=${gamepassId}`
    )

    if (!response.ok) {
      throw new Error("Failed")
    }

    const data = await response.json()

    console.log("GAMEPASS DATA:", data)

    setGamepassData({
      name:
        data?.name ||
        data?.Name ||
        "Unknown",

      creator:
        data?.creator ||
        data?.Creator?.Name ||
        "Unknown",

      price:
        data?.price ??
        data?.priceInRobux ??
        data?.PriceInRobux ??
        null,

      accessible:
        data?.accessible ??
        data?.IsForSale ??
        false,

      regionalPricing:
        data?.regionalPricing === "ON" ||
        data?.regionalPricing === true,
    })
  } catch (error) {
    console.error(error)

    setGamepassData({
      name: "Unknown",
      creator: "Unknown",
      price: null,
      accessible: false,
      regionalPricing: false,
    })
  }

  setCheckingGamepass(false)
}