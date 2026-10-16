/** Row shape of the dashboard mock table data (src/data/DashboardRows.json). */
export interface IDashboardRow {
    id: string
    createdBy: string
    createdByImage: string
    title: string
    category: string
    amountRaised: string
    goal: string
    contributors: number
    country: string
}

export interface ITestimonial {
    id: string
    testimonial: string
    createdBy: string
    createdByImage: string
    company: string
    jobPosition: string
}

export interface ICountry {
    name: string
    code: string
    emoji: string
    unicode: string
    image: string
}

export interface ICurrency {
    cc: string
    symbol: string
    name: string
}
