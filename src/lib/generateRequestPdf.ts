export interface PdfDayCluster {
  cityLabel: string
  companyLines: string[]
}

export interface PdfDay {
  dayNumber: number
  date: string
  clusters: PdfDayCluster[]
}

export interface RequestPdfData {
  locale: 'ru' | 'en'
  tourTitle: string
  tripDays: number
  dateRangeLabel: string
  peopleCount: number
  companyLines: string[]
  itinerary: PdfDay[]
  contact: {
    companyName: string
    name: string
    phone: string
    email: string
    telegram: string
  }
}

const LABELS = {
  ru: {
    heading: 'Заявка на программу',
    generated: 'Сформировано',
    tour: 'Формат',
    dates: 'Даты',
    people: 'Количество участников',
    companies: 'Выбранные компании',
    itinerary: 'Программа по дням',
    contact: 'Контактные данные',
    contactCompany: 'Компания',
    contactName: 'Имя',
    contactPhone: 'Телефон',
    contactEmail: 'Email',
    contactTelegram: 'Telegram',
    footer: 'Global Tech Tour — info@globaltechtour.ru',
    day: 'День',
  },
  en: {
    heading: 'Program Request',
    generated: 'Generated',
    tour: 'Format',
    dates: 'Dates',
    people: 'Participants',
    companies: 'Selected companies',
    itinerary: 'Day-by-day plan',
    contact: 'Contact details',
    contactCompany: 'Company',
    contactName: 'Name',
    contactPhone: 'Phone',
    contactEmail: 'Email',
    contactTelegram: 'Telegram',
    footer: 'Global Tech Tour — info@globaltechtour.ru',
    day: 'Day',
  },
}

const PAGE_WIDTH = 210
const MARGIN = 18
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2

/** Builds the request-summary PDF client-side and returns it as a Blob — no server round-trip. */
export async function generateRequestPdf(data: RequestPdfData): Promise<Blob> {
  // jsPDF (and the Cyrillic font data below) are only needed on this one
  // page action — dynamic imports keep them out of the app's main bundle.
  const [{ jsPDF }, { PT_SANS_REGULAR_BASE64, PT_SANS_BOLD_BASE64 }] = await Promise.all([
    import('jspdf'),
    import('@/assets/fonts/ptSansBase64'),
  ])
  const t = LABELS[data.locale]

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  doc.addFileToVFS('PTSans-Regular.ttf', PT_SANS_REGULAR_BASE64)
  doc.addFont('PTSans-Regular.ttf', 'PTSans', 'normal')
  doc.addFileToVFS('PTSans-Bold.ttf', PT_SANS_BOLD_BASE64)
  doc.addFont('PTSans-Bold.ttf', 'PTSans', 'bold')
  doc.setFont('PTSans', 'normal')

  let y = MARGIN

  function ensureSpace(nextLineHeight: number) {
    if (y + nextLineHeight > 297 - MARGIN) {
      doc.addPage()
      y = MARGIN
    }
  }

  function heading(text: string, size = 13) {
    ensureSpace(10)
    doc.setFont('PTSans', 'bold')
    doc.setFontSize(size)
    doc.setTextColor(23, 23, 29)
    doc.text(text, MARGIN, y)
    y += size * 0.5
    doc.setFont('PTSans', 'normal')
  }

  function bodyLine(text: string, size = 10.5, color: [number, number, number] = [69, 69, 78]) {
    doc.setFontSize(size)
    doc.setTextColor(...color)
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH)
    for (const line of lines) {
      ensureSpace(size * 0.55)
      doc.text(line, MARGIN, y)
      y += size * 0.55
    }
  }

  function rule() {
    ensureSpace(4)
    y += 1.5
    doc.setDrawColor(220, 220, 225)
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y)
    y += 5
  }

  // Header
  doc.setFont('PTSans', 'bold')
  doc.setFontSize(19)
  doc.setTextColor(37, 99, 235)
  doc.text('Global Tech Tour', MARGIN, y)
  y += 8
  doc.setFontSize(12)
  doc.setTextColor(23, 23, 29)
  doc.text(t.heading, MARGIN, y)
  y += 6
  doc.setFont('PTSans', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(107, 107, 118)
  doc.text(`${t.generated}: ${new Date().toLocaleDateString(data.locale === 'ru' ? 'ru-RU' : 'en-US')}`, MARGIN, y)
  y += 3
  rule()

  heading(data.tourTitle, 14)
  bodyLine(`${t.tour}: ${data.tripDays} ${data.locale === 'ru' ? 'дней' : 'days'}`)
  bodyLine(`${t.dates}: ${data.dateRangeLabel}`)
  bodyLine(`${t.people}: ${data.peopleCount}`)
  rule()

  heading(t.companies)
  for (const line of data.companyLines) bodyLine(`•  ${line}`)
  rule()

  heading(t.itinerary)
  for (const day of data.itinerary) {
    ensureSpace(8)
    doc.setFont('PTSans', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(37, 99, 235)
    doc.text(`${t.day} ${day.dayNumber} · ${day.date}`, MARGIN, y)
    y += 5.5
    doc.setFont('PTSans', 'normal')
    for (const cluster of day.clusters) {
      bodyLine(cluster.cityLabel, 10, [23, 23, 29])
      bodyLine(cluster.companyLines.join(', '))
    }
    y += 1.5
  }
  rule()

  heading(t.contact)
  bodyLine(`${t.contactCompany}: ${data.contact.companyName}`)
  bodyLine(`${t.contactName}: ${data.contact.name}`)
  bodyLine(`${t.contactPhone}: ${data.contact.phone}`)
  bodyLine(`${t.contactEmail}: ${data.contact.email}`)
  bodyLine(`${t.contactTelegram}: ${data.contact.telegram}`)

  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFont('PTSans', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 158)
    doc.text(t.footer, MARGIN, 297 - 10)
  }

  return doc.output('blob')
}
