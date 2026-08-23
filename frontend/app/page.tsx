const categories = [
  {
    name: "Men",
    description: "Tailored essentials",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Women",
    description: "Soft layers & statement pieces",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Kids",
    description: "Playful comfort",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Accessories",
    description: "Finish every look",
    image:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80",
  },
];

const featuredProducts = [
  {
    name: "Luna Linen Set",
    price: "$84",
    tag: "Bestseller",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Urban Utility Jacket",
    price: "$120",
    tag: "New",
    image:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Crest Knit Tee",
    price: "$42",
    tag: "Trending",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Nordic Everyday Tote",
    price: "$58",
    tag: "Limited",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
  },
];

const testimonials = [
  {
    name: "Aisha M.",
    text: "Forma feels premium from browsing to checkout. The sizing guide and quick delivery made it stress-free.",
  },
  {
    name: "Daniel K.",
    text: "The catalog is easy to filter and the product details are clear. It feels like a modern fashion store built for real shoppers.",
  },
  {
    name: "Rina P.",
    text: "I love the clean design and the quality of the product pages. It is perfect for a growing clothing brand.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5f1eb] text-[#1f1d1a]">
      <header className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between rounded-full border border-[#e7dfd5] bg-white/80 px-5 py-3 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#201d1b] text-sm font-bold uppercase tracking-[0.25em] text-white">
              F
            </div>
            <div>
              <p className="text-xl font-semibold tracking-[0.32em]">FORMA</p>
            </div>
          </div>

          <div className="hidden items-center gap-8 text-sm font-medium text-[#4a433d] md:flex">
            <a href="#home" className="transition hover:text-[#221f1d]">Home</a>
            <a href="#shop" className="transition hover:text-[#221f1d]">Shop</a>
            <a href="#collections" className="transition hover:text-[#221f1d]">Collections</a>
            <a href="#sale" className="transition hover:text-[#221f1d]">Sale</a>
            <a href="#reviews" className="transition hover:text-[#221f1d]">Reviews</a>
          </div>

          <div className="flex items-center gap-3">
            <button className="hidden rounded-full border border-[#d8cfc2] bg-[#f8f4ef] px-4 py-2 text-sm font-medium sm:inline-flex">
              Search
            </button>
            <button className="rounded-full bg-[#201d1b] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#312c29]">
              Shop Now
            </button>
          </div>
        </nav>
      </header>

      <main id="home" className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[32px] bg-[#efe7df] shadow-[0_30px_80px_rgba(26,21,18,0.08)]">
          <div className="grid items-center gap-10 px-6 py-10 md:grid-cols-2 md:px-10 lg:px-14 lg:py-14">
            <div>
              <span className="inline-flex rounded-full border border-[#d4c3b3] bg-[#f9f5f1] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#5a514c]">
                New season essentials
              </span>
              <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-none tracking-[-0.06em] text-[#201d1b] sm:text-5xl lg:text-7xl">
                Dress better.
                <span className="block text-[#7d685e]">Live brighter.</span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-[#564d49] sm:text-lg">
                Discover elevated everyday fashion for men, women, and kids with premium quality, easy shopping, and trend-led collections designed for every season.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <button className="rounded-full bg-[#201d1b] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#352f2d]">
                  Shop Collections
                </button>
                <button className="rounded-full border border-[#d7cabd] bg-white px-6 py-3 text-sm font-medium text-[#201d1b] transition hover:bg-[#f4eee8]">
                  Explore Deal
                </button>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-8 text-sm text-[#4d4541]">
                <div>
                  <p className="text-2xl font-semibold text-[#201d1b]">45k+</p>
                  <p>happy shoppers</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[#201d1b]">4.9/5</p>
                  <p>customer rating</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[#201d1b]">24/7</p>
                  <p>online support</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-4 top-8 h-40 w-40 rounded-full bg-[#d6b49e]/50 blur-3xl" />
              <div className="absolute -bottom-6 right-2 h-52 w-52 rounded-full bg-[#c9b3a2]/60 blur-3xl" />
              <div className="relative rounded-[28px] border border-white/40 bg-white/40 p-4 backdrop-blur-sm">
                <img
                  src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80"
                  alt="Fashion model"
                  className="h-[520px] w-full rounded-[22px] object-cover object-center"
                />
                <div className="absolute bottom-8 left-8 rounded-2xl bg-white/90 p-4 shadow-xl backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#7b6d65]">This week</p>
                  <p className="mt-2 text-2xl font-semibold text-[#201d1b]">Up to 50% off</p>
                  <p className="text-sm text-[#5b4f49]">New arrivals in premium essentials</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="collections" className="mt-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7b6d65]">Shop by category</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#201d1b]">Trending collections</h2>
            </div>
            <a href="#shop" className="text-sm font-medium text-[#201d1b] underline-offset-4 hover:underline">
              View all
            </a>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {categories.map((category) => (
              <article key={category.name} className="group overflow-hidden rounded-[26px] border border-[#e6ddd3] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <p className="text-sm uppercase tracking-[0.18em] text-[#7b6d65]">{category.name}</p>
                  <h3 className="mt-3 text-2xl font-semibold text-[#201d1b]">{category.description}</h3>
                  <button className="mt-5 rounded-full border border-[#d9cfc3] px-4 py-2 text-sm font-medium text-[#201d1b] transition hover:bg-[#f5f0eb]">
                    Explore
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="shop" className="mt-20 rounded-[32px] bg-[#1d1a18] px-6 py-8 text-white sm:px-8 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#d1c1b0]">Best sellers</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">Fresh fits for every day</h2>
            </div>
            <button className="rounded-full border border-[#3d3632] bg-[#2a2624] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#34302d]">
              View more
            </button>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featuredProducts.map((product) => (
              <article key={product.name} className="overflow-hidden rounded-[24px] border border-[#322d2b] bg-[#241f1d]">
                <div className="relative">
                  <img src={product.image} alt={product.name} className="h-72 w-full object-cover" />
                  <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#201d1b]">
                    {product.tag}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xl font-semibold text-white">{product.name}</h3>
                    <span className="text-lg font-semibold text-[#e9d7c3]">{product.price}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex text-[#f1d3ac]">
                      {"★★★★★"}
                    </div>
                    <button className="rounded-full bg-[#f3efe9] px-4 py-2 text-sm font-medium text-[#201d1b] transition hover:bg-white">
                      Add to cart
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="sale" className="mt-20 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-[28px] bg-[#e7d8c9] p-6 sm:p-8">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-[#6b554d]">Seasonal offer</p>
                <h2 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-[#201d1b]">Curated looks for smart living.</h2>
              </div>
              <button className="rounded-full bg-[#201d1b] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#312b29]">
                Shop the sale
              </button>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[22px] bg-white/70 p-4">
                <p className="text-sm text-[#645b57]">Free shipping</p>
                <p className="mt-2 text-2xl font-semibold text-[#211f1d]">On orders $75+</p>
              </div>
              <div className="rounded-[22px] bg-white/70 p-4">
                <p className="text-sm text-[#645b57]">Easy returns</p>
                <p className="mt-2 text-2xl font-semibold text-[#211f1d]">Within 30 days</p>
              </div>
              <div className="rounded-[22px] bg-white/70 p-4">
                <p className="text-sm text-[#645b57]">Secure checkout</p>
                <p className="mt-2 text-2xl font-semibold text-[#211f1d]">100% protected</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] bg-[#f5efe8] p-6 shadow-sm ring-1 ring-[#e6ddd3] sm:p-8">
            <p className="text-sm uppercase tracking-[0.22em] text-[#7a695f]">Why shoppers choose us</p>
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#201d1b]">Premium quality</h3>
                <p className="mt-2 text-[#544c48]">Thoughtful fabrics, clean silhouettes, and durable design for everyday wear.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#201d1b]">Smooth checkout</h3>
                <p className="mt-2 text-[#544c48]">Quick cart updates, secure payments, and clear delivery tracking from order to doorstep.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#201d1b]">Loyalty rewards</h3>
                <p className="mt-2 text-[#544c48]">Exclusive deals and member savings for repeat customers and frequent shoppers.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="reviews" className="mt-20">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7b6d65]">Customer love</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#201d1b]">What people are saying</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((item) => (
              <article key={item.name} className="rounded-[24px] border border-[#e8ded3] bg-white p-6 shadow-sm">
                <div className="text-[#ebc18d] text-lg">★★★★★</div>
                <p className="mt-5 text-base leading-7 text-[#4d4541]">“{item.text}”</p>
                <div className="mt-6 border-t border-[#f0e8e4] pt-4">
                  <p className="font-semibold text-[#201d1b]">{item.name}</p>
                  <p className="text-sm text-[#7d706a]">Verified shopper</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20 rounded-[32px] bg-[#f1e6dc] p-8 sm:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-[#735c52]">Stay in the loop</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#201d1b]">Get exclusive drops and offers.</h2>
            </div>
            <div className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                className="h-12 flex-1 rounded-full border border-[#d7cabd] bg-white px-4 text-sm text-[#201d1b] outline-none ring-0 placeholder:text-[#756d68]"
              />
              <button className="h-12 rounded-full bg-[#201d1b] px-6 text-sm font-medium text-white transition hover:bg-[#312d2b]">
                Join now
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e3d9d0] bg-[#f7f3ef]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 text-sm text-[#544d49] sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr] lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#201d1b] text-xs font-bold uppercase tracking-[0.2em] text-white">
                F
              </div>
              <p className="text-lg font-semibold tracking-[0.26em] text-[#201d1b]">FORMA</p>
            </div>
            <p className="mt-4 max-w-xs leading-6">
              Modern essentials for everyday style, designed to make wardrobes easier, sharper, and more personal.
            </p>
          </div>

          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-[#201d1b]">Shop</p>
            <ul className="mt-4 space-y-2">
              <li>New Arrivals</li>
              <li>Men</li>
              <li>Women</li>
              <li>Kids</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-[#201d1b]">Support</p>
            <ul className="mt-4 space-y-2">
              <li>Delivery</li>
              <li>Returns</li>
              <li>FAQs</li>
              <li>Contact</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-[#201d1b]">Company</p>
            <ul className="mt-4 space-y-2">
              <li>About</li>
              <li>Journal</li>
              <li>Careers</li>
              <li>Privacy</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
