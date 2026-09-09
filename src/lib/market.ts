import business from "../../data/business.json";

export type MarketImage = { image_path: string; alt_text: string };
export type MarketButton = { text: string; link?: string; action?: string };
export type MarketCard = {
  heading: string;
  description: string;
  icon?: string;
  image?: MarketImage;
  label?: string;
  color?: string;
  button?: MarketButton;
};
export type MarketSection = {
  type: "cards" | "food" | "story" | "csa" | "faq" | "callout";
  eyebrow?: string;
  heading?: string;
  accent?: string;
  description?: string;
  note?: string;
  icon?: string;
  cards?: MarketCard[];
  paragraphs?: { text: string }[];
  button?: MarketButton;
  pickup_heading?: string;
  pickup_description?: string;
  questions?: { question: string; answer: string }[];
};
export type MarketDetail = {
  kind: "detail";
  title: string;
  slug: string;
  hero: {
    eyebrow: string;
    heading: string;
    accent: string;
    description: string;
    image: MarketImage;
    button: MarketButton;
    show_phone?: boolean;
    note?: string;
  };
  sections: MarketSection[];
};

export function actionLink(button?: MarketButton): string {
  if (button?.link) return button.link;
  switch (button?.action) {
    case "order":
      return business.order_url;
    case "directions":
      return business.directions_url;
    case "phone":
      return business.phone_link;
    case "email":
      return "mailto:" + business.email;
    case "csa":
      return (
        "mailto:" +
        business.email +
        "?subject=" +
        encodeURIComponent("CSA enquiry")
      );
    case "gift":
      return (
        "mailto:" +
        business.email +
        "?subject=" +
        encodeURIComponent("Custom gift basket enquiry") +
        "&body=" +
        encodeURIComponent(
          "Hello Gammon’s!\n\nI’d love a gift basket.\nBudget: \nOccasion or preferences: \nPreferred pickup date: \n\nThank you!",
        )
      );
    case "jobs":
      return business.jobs_url;
    default:
      return "/visit/";
  }
}
