#!/usr/bin/env python3
"""Install per-route metadata layouts so each page has unique SEO data."""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE_URL = 'https://petprintsstudio.com'

ROUTES = {
    'create': {
        'title': 'Create Your Custom Pet Portrait — Upload & Go',
        'description': "Upload a photo of your pet, pick one of 8 fine art styles, and get a custom portrait + original song. Delivered to your door in 5-7 days.",
        'keywords': ['create pet portrait', 'custom pet portrait upload', 'ai pet portrait', 'pet portrait from photo'],
    },
    'shop': {
        'title': 'Shop Pet Portraits, Canvases & Luxury Pet Goods',
        'description': "Browse canvas prints, fine art prints, pillows, and blankets — all featuring custom portraits of your pet. Starting at $49.",
        'keywords': ['pet portrait canvas', 'custom pet pillow', 'pet portrait blanket', 'pet gifts'],
    },
    'styles': {
        'title': '8 Fine Art Portrait Styles — Browse Our Curated Library',
        'description': "From classical oil paintings to modern editorial acrylics, choose the perfect style for your pet's portrait. All 8 curated styles included.",
        'keywords': ['pet portrait styles', 'oil painting pet portrait', 'watercolor pet portrait', 'pet art styles'],
    },
    'gallery': {
        'title': 'Pet Portrait Gallery — Real Customer Portraits',
        'description': "Real pet portraits from real customers. Browse our gallery of custom canvas paintings — dogs, cats, and every pet in between.",
        'keywords': ['pet portrait examples', 'custom pet portrait gallery', 'dog portrait gallery'],
    },
    'bespoke': {
        'title': 'Bespoke Pet Portraits — Work 1-on-1 With an Artist',
        'description': "Work directly with a human artist for a truly bespoke pet portrait. Hand-painted, fully customized, delivered in 10-14 days.",
        'keywords': ['bespoke pet portrait', 'custom commissioned pet portrait', 'hand painted pet portrait'],
    },
    'about': {
        'title': 'About Pet Prints Studio — Our Story',
        'description': "Built by pet lovers for pet lovers. Learn why we started Pet Prints Studio in Wilmington, NC and how we make every portrait personal.",
        'keywords': ['about pet prints studio', 'pet portrait company'],
    },
    'faq': {
        'title': 'FAQ — Shipping, Sizes, Photos & Everything Else',
        'description': "Answers to common questions about custom pet portraits: shipping times, sizing, photo requirements, returns, and the custom song included.",
        'keywords': ['pet portrait faq', 'pet portrait questions'],
    },
    'shipping': {
        'title': 'Shipping & Returns — Fast US Shipping',
        'description': "Ships in 5-7 business days within the US. 30-day satisfaction guarantee. Details on our shipping and return policy.",
        'keywords': ['pet portrait shipping', 'pet portrait returns'],
    },
    'cart': {
        'title': 'Your Cart',
        'description': "Review your selection and proceed to checkout.",
        'noindex': True,
    },
}

LAYOUT_TEMPLATE = '''import type {{ Metadata }} from 'next'

export const metadata: Metadata = {{
  title: '{title}',
  description: '{description}',{keywords_block}
  alternates: {{
    canonical: '{canonical}',
  }},{robots_block}
  openGraph: {{
    title: '{title}',
    description: '{description}',
    url: '{canonical}',
  }},
  twitter: {{
    title: '{title}',
    description: '{description}',
  }},
}}

export default function Layout({{ children }}: {{ children: React.ReactNode }}) {{
  return <>{{children}}</>
}}
'''

def build_layout(route_slug, meta):
    canonical = f'{BASE_URL}/{route_slug}'
    keywords_block = ''
    if meta.get('keywords'):
        kw_list = ', '.join(f"'{k}'" for k in meta['keywords'])
        keywords_block = f"\n  keywords: [{kw_list}],"
    robots_block = ''
    if meta.get('noindex'):
        robots_block = "\n  robots: { index: false, follow: true },"
    return LAYOUT_TEMPLATE.format(
        title=meta['title'].replace("'", "\\'"),
        description=meta['description'].replace("'", "\\'"),
        canonical=canonical,
        keywords_block=keywords_block,
        robots_block=robots_block,
    )

created = 0
skipped = 0
for route, meta in ROUTES.items():
    folder = os.path.join(ROOT, 'app', route)
    if not os.path.isdir(folder):
        print(f'  SKIP  /{route} - folder does not exist')
        skipped += 1
        continue
    layout_path = os.path.join(folder, 'layout.tsx')
    if os.path.exists(layout_path):
        print(f'  SKIP  /{route} - layout.tsx already exists')
        skipped += 1
        continue
    content = build_layout(route, meta)
    with open(layout_path, 'w') as f:
        f.write(content)
    print(f'  OK    /{route} - layout.tsx created with unique metadata')
    created += 1

print('')
print(f'Done. {created} layouts created, {skipped} skipped.')
