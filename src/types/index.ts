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
