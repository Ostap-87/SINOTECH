const BRANDS = [
  'BYD', 'XIAOMI', 'ALIBABA', 'BAIDU', 'TENCENT', 'XPENG', 'ZEEKR', 'CHAGEE', 'HEYTEA',
  'LUCKYN COFFEE', 'SIEMENS', 'UBTECH', 'AGIBOT', 'UNITREE', 'GAC', 'KEPLER', 'JD',
  'TESLA', 'ALIPAY', 'WECHAT', 'IFLYTEK',
]

function MarqueeItems() {
  return (
    <>
      {BRANDS.map((brand, index) => (
        <span
          key={index}
          className="mx-8 inline-block text-3xl font-semibold tracking-[-0.02em] text-bone-white/25 sm:text-4xl"
        >
          {brand}
        </span>
      ))}
    </>
  )
}

export function BrandMarquee() {
  return (
    <div className="pointer-events-none w-full overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}>
      <div className="brand-marquee-track flex w-max whitespace-nowrap">
        <MarqueeItems />
        <MarqueeItems />
      </div>
    </div>
  )
}
