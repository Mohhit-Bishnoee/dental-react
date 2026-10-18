import { useEffect, useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Baby,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Heart,
  Mail,
  MapPin,
  Menu,
  Phone,
  ScanFace,
  ShieldCheck,
  Smile,
  Sparkles,
  Stethoscope,
  Users,
  X,
} from 'lucide-react'
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'

const currentYear = new Date().getFullYear()

const clinicImage =
  'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1400&q=85'

const services = [
  {
    title: 'General dentistry',
    description: 'The everyday checkups and gentle treatments that keep your smile in great shape.',
    icon: Stethoscope,
    image:
      'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=900&q=80',
    tag: 'Healthy foundations',
  },
  {
    title: 'Cosmetic dentistry',
    description: 'Subtle, considered treatments to help your smile look and feel its very best.',
    icon: Sparkles,
    image:
      'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=900&q=80',
    tag: 'Smile with confidence',
  },
  {
    title: 'Teeth whitening',
    description: 'Professional whitening options, tailored to your teeth and your goals.',
    icon: Smile,
    image:
      'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=900&q=80',
    tag: 'A brighter smile',
  },
  {
    title: 'Dental implants',
    description: 'Long-lasting, natural-looking tooth replacement, planned around you.',
    icon: ShieldCheck,
    image:
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=900&q=80',
    tag: 'Made to feel like you',
  },
  {
    title: 'Invisalign®',
    description: 'A discreet way to straighten your teeth with a clear, personal treatment plan.',
    icon: ScanFace,
    image:
      'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=900&q=80',
    tag: 'A straighter smile',
  },
  {
    title: 'Children’s dentistry',
    description: 'Positive, patient-first visits that help little smiles grow up healthy.',
    icon: Baby,
    image:
      'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=900&q=80',
    tag: 'Care for every age',
  },
]

const team = [
  {
    name: 'Dr. Olivia Bennett',
    role: 'Lead dentist · Cosmetic care',
    image:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=85',
  },
  {
    name: 'Dr. Ethan Cole',
    role: 'Dentist · Restorative care',
    image:
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=800&q=85',
  },
  {
    name: 'Dr. Sophia Patel',
    role: 'Dentist · Family dentistry',
    image:
      'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=800&q=85',
  },
]

function ScrollToTop() {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      window.setTimeout(() => {
        document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth' })
      }, 60)
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [location.pathname, location.hash])

  return null
}

function Logo({ light = false }) {
  return (
    <Link
      to="/"
      aria-label="Everwell Dental home"
      className={`inline-flex items-center gap-2.5 ${light ? 'text-white' : 'text-[#132744]'}`}
    >
      <span className="flex size-10 items-center justify-center rounded-[14px] bg-[#4ac5b4] text-[#102640]">
        <Smile size={23} strokeWidth={2.2} />
      </span>
      <span className="text-[21px] font-bold tracking-[-0.06em]">
        everwell<span className="font-medium text-[#45b9ab]">.</span>
        <span className={`ml-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${light ? 'text-white/50' : 'text-slate-400'}`}>
          dental
        </span>
      </span>
    </Link>
  )
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)
  const navClass = ({ isActive }) =>
    `transition-colors hover:text-[#249d91] ${isActive ? 'text-[#168e84]' : 'text-[#526176]'}`

  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="hidden bg-[#142945] text-[11px] text-white/75 md:block">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-2.5">
          <p className="flex items-center gap-2">
            <MapPin size={13} className="text-[#58caba]" />
            128 Willow Lane, Brooklyn, NY 11201
          </p>
          <div className="flex items-center gap-6">
            <p className="flex items-center gap-2">
              <Clock3 size={13} className="text-[#58caba]" />
              Mon – Fri, 8:00 am – 6:00 pm
            </p>
            <a className="flex items-center gap-2 hover:text-white" href="tel:+12125550148">
              <Phone size={13} className="text-[#58caba]" />
              (212) 555-0148
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-4 sm:px-8">
        <Logo />
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-xl p-2 text-[#142945] hover:bg-slate-100 md:hidden"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
        <nav
          className={`${menuOpen ? 'flex' : 'hidden'} absolute left-0 right-0 top-full flex-col gap-5 border-t border-slate-100 bg-white px-6 py-6 shadow-xl md:static md:flex md:flex-row md:items-center md:gap-8 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
          aria-label="Main navigation"
        >
          <NavLink onClick={closeMenu} to="/" end className={navClass}>Home</NavLink>
          <NavLink onClick={closeMenu} to="/services" className={navClass}>Services</NavLink>
          <NavLink onClick={closeMenu} to="/about" className={navClass}>About us</NavLink>
          <NavLink onClick={closeMenu} to="/team" className={navClass}>Our team</NavLink>
          <NavLink onClick={closeMenu} to="/contact" className={navClass}>Contact</NavLink>
          <Link
            onClick={closeMenu}
            to="/contact#appointment"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#142945] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#20466e]"
          >
            Book a visit <ArrowUpRight size={15} />
          </Link>
        </nav>
      </div>
    </header>
  )
}

function Eyebrow({ children, light = false }) {
  return (
    <p className={`mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.19em] ${light ? 'text-[#8be0d2]' : 'text-[#208e83]'}`}>
      <span className={`h-px w-7 ${light ? 'bg-[#8be0d2]' : 'bg-[#208e83]'}`} />
      {children}
    </p>
  )
}

function SectionHeading({ eyebrow, title, text, light = false }) {
  return (
    <div className="max-w-[650px]">
      <Eyebrow light={light}>{eyebrow}</Eyebrow>
      <h2 className={`text-3xl font-semibold leading-[1.12] tracking-[-0.045em] sm:text-[42px] ${light ? 'text-white' : 'text-[#142945]'}`}>
        {title}
      </h2>
      {text && <p className={`mt-4 max-w-xl text-[15px] leading-7 ${light ? 'text-white/65' : 'text-slate-500'}`}>{text}</p>}
    </div>
  )
}

function ServiceCard({ service, index }) {
  const Icon = service.icon
  return (
    <article className="group overflow-hidden rounded-[20px] border border-slate-100 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_-34px_rgba(20,41,69,0.35)]">
      <div className="relative h-[205px] overflow-hidden bg-[#e8efec]">
        <img
          src={service.image}
          alt={`${service.title} at Everwell Dental`}
          loading={index > 2 ? 'lazy' : 'eager'}
          className="size-full object-cover transition duration-700 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4556] backdrop-blur">
          {service.tag}
        </span>
      </div>
      <div className="p-5 sm:p-6">
        <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-[#e8f6f3] text-[#218f83]">
          <Icon size={19} />
        </div>
        <h3 className="text-[19px] font-semibold tracking-tight text-[#142945]">{service.title}</h3>
        <p className="mt-2 min-h-[50px] text-[13px] leading-6 text-slate-500">{service.description}</p>
        <Link to="/contact#appointment" className="mt-4 inline-flex items-center gap-2 text-[13px] font-semibold text-[#188c80] hover:gap-3">
          Ask about this service <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  )
}

function ButtonLink({ to, children, secondary = false }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition ${
        secondary
          ? 'border border-white/30 text-white hover:bg-white/10'
          : 'bg-[#4ac5b4] text-[#102640] hover:bg-[#6dd6c8]'
      }`}
    >
      {children} <ArrowRight size={16} />
    </Link>
  )
}

function HomePage() {
  return (
    <>
      <section className="bg-[#f7f8f5]">
        <div className="mx-auto grid max-w-[1240px] items-center gap-10 px-5 py-10 sm:px-8 sm:py-14 lg:min-h-[580px] lg:grid-cols-[0.92fr_1.08fr] lg:gap-8 lg:py-16">
          <div className="relative z-10 py-4 lg:py-10">
            <Eyebrow>Family dentistry, thoughtfully done</Eyebrow>
            <h1 className="max-w-[620px] text-[44px] font-semibold leading-[1.04] tracking-[-0.055em] text-[#142945] sm:text-[58px] lg:text-[64px]">
              A little more <span className="font-serif italic font-normal text-[#279b8c]">care</span> in every smile.
            </h1>
            <p className="mt-6 max-w-[490px] text-[16px] leading-7 text-slate-500">
              Modern dentistry, made personal. We’re here to make looking after your smile feel easy, comfortable, and all about you.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink to="/contact#appointment">Book your first visit</ButtonLink>
              <Link to="/services" className="inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold text-[#142945] hover:text-[#168e84]">
                Explore our care <ArrowRight size={16} />
              </Link>
            </div>
            <div className="mt-9 flex items-center gap-3">
              <div className="flex -space-x-2">
                {team.map((person) => (
                  <img key={person.name} src={person.image} alt="" className="size-9 rounded-full border-2 border-[#f7f8f5] object-cover" />
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 text-[#e0a744]" aria-label="Rated 5 out of 5">
                  {Array.from({ length: 5 }, (_, index) => <span key={index}>★</span>)}
                </div>
                <p className="text-[11px] text-slate-500">A 5-star experience, from real neighbours</p>
              </div>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[590px] lg:ml-auto">
            <div className="absolute -right-3 -top-3 h-28 w-28 rounded-tr-[50px] border-r border-t border-[#64c7b7] sm:-right-5 sm:-top-5" />
            <div className="relative h-[340px] overflow-hidden rounded-[28px] sm:h-[460px]">
              <img src={clinicImage} alt="A patient enjoying her visit to a modern dental clinic" className="size-full object-cover object-center" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#132744]/45 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3 sm:bottom-7 sm:left-7 sm:right-7">
                <div className="rounded-2xl border border-white/30 bg-white/90 px-4 py-3 shadow-lg backdrop-blur sm:px-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#218f83]">Your neighborhood dentist</p>
                  <p className="mt-1 text-sm font-semibold text-[#142945]">Good care. Good people. Great smiles.</p>
                </div>
                <div className="hidden size-14 shrink-0 items-center justify-center rounded-full bg-[#4ac5b4] text-[#142945] sm:flex">
                  <ArrowUpRight size={23} />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-3 hidden items-center gap-3 rounded-2xl bg-white p-4 shadow-[0_16px_45px_-20px_rgba(19,39,68,0.3)] sm:flex lg:-left-8">
              <span className="flex size-11 items-center justify-center rounded-full bg-[#e7f5f1] text-[#218f83]"><Heart size={20} /></span>
              <div><p className="text-sm font-bold text-[#142945]">Gentle by nature</p><p className="mt-0.5 text-xs text-slate-500">Always here to listen</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1240px] gap-0 px-5 py-7 sm:grid-cols-3 sm:px-8">
        {[
          { icon: Phone, title: 'Call our friendly team', detail: '(212) 555-0148', href: 'tel:+12125550148' },
          { icon: Clock3, title: 'Clinic opening hours', detail: 'Mon – Fri, 8:00 am – 6:00 pm', href: '/contact' },
          { icon: MapPin, title: 'Right around the corner', detail: '128 Willow Lane, Brooklyn', href: '/contact' },
        ].map(({ icon: Icon, title, detail, href }) => (
          <a key={title} href={href} className="flex items-center gap-4 border-b border-slate-100 py-5 last:border-0 sm:border-b-0 sm:border-r sm:px-5 sm:first:pl-0 sm:last:border-0">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#eaf6f3] text-[#218f83]"><Icon size={18} /></span>
            <span><span className="block text-[11px] font-medium text-slate-400">{title}</span><span className="mt-1 block text-[13px] font-semibold text-[#142945]">{detail}</span></span>
          </a>
        ))}
      </section>

      <section className="bg-white px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1240px]">
          <div className="mb-9 flex flex-col justify-between gap-5 sm:mb-12 sm:flex-row sm:items-end">
            <SectionHeading eyebrow="Care for every kind of smile" title="Thoughtful care, all under one roof." text="From your little one's first checkup to a smile refresh, we're here for every chapter." />
            <ButtonLink to="/services" secondary={false}>All dental services</ButtonLink>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 3).map((service, index) => <ServiceCard key={service.title} service={service} index={index} />)}
          </div>
        </div>
      </section>

      <section className="bg-[#edf5f1] px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-[1120px] items-center gap-10 lg:grid-cols-[0.94fr_1.06fr] lg:gap-16">
          <div className="relative">
            <img src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=85" alt="Welcoming, modern dental clinic interior" loading="lazy" className="h-[320px] w-full rounded-[24px] object-cover sm:h-[420px]" />
            <div className="absolute -bottom-5 right-4 flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-xl sm:right-8">
              <Award className="text-[#208e83]" size={24} />
              <div><p className="text-sm font-bold text-[#142945]">Care you can trust</p><p className="text-xs text-slate-500">Here for your whole family</p></div>
            </div>
          </div>
          <div className="pt-3 lg:pt-0">
            <SectionHeading eyebrow="The Everwell difference" title="You deserve to feel good about your dentist." text="We believe the best care starts with a conversation. So we listen first, explain everything clearly, and make a plan that feels right for you." />
            <ul className="mt-7 grid gap-4 sm:grid-cols-2">
              {['A gentle, no-rush approach', 'Clear answers and pricing', 'Modern, comfortable clinic', 'A team that knows your name'].map((point) => (
                <li key={point} className="flex items-start gap-2 text-[13px] font-medium leading-5 text-[#34465d]"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-[#218f83]" />{point}</li>
              ))}
            </ul>
            <Link to="/about" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#188c80]">Get to know us <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <section className="bg-[#142945] px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto flex max-w-[1120px] flex-col items-start justify-between gap-7 sm:flex-row sm:items-center">
          <div className="max-w-[650px]"><Eyebrow light>Your next chapter starts here</Eyebrow><h2 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-[40px]">Ready for a dental visit that feels different?</h2><p className="mt-3 text-sm leading-6 text-white/60">Tell us what you need. We’ll take it from here.</p></div>
          <ButtonLink to="/contact#appointment">Let’s find a time</ButtonLink>
        </div>
      </section>
    </>
  )
}

function PageHero({ eyebrow, title, text, image = clinicImage }) {
  return (
    <section className="bg-[#f5f7f4] px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto grid max-w-[1160px] items-center gap-9 lg:grid-cols-[1fr_0.8fr] lg:gap-16">
        <div><Eyebrow>{eyebrow}</Eyebrow><h1 className="max-w-2xl text-[42px] font-semibold leading-[1.06] tracking-[-0.05em] text-[#142945] sm:text-[58px]">{title}</h1><p className="mt-5 max-w-xl text-[15px] leading-7 text-slate-500">{text}</p></div>
        <img src={image} alt="" className="h-[260px] w-full rounded-[24px] object-cover sm:h-[330px]" />
      </div>
    </section>
  )
}

function ServicesPage() {
  return (
    <>
      <PageHero eyebrow="Our services" title="Good care for every kind of smile." text="A full range of thoughtful dental care, delivered by people who take the time to get to know you." image="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=85" />
      <section className="px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-[1240px]">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><SectionHeading eyebrow="Explore our care" title="The right care, right here." text="Not sure where to start? Book a chat and we'll help you find the right next step." /><Link to="/contact#appointment" className="inline-flex items-center gap-2 text-sm font-semibold text-[#188c80]">Ask our team <ArrowRight size={16} /></Link></div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{services.map((service, index) => <ServiceCard key={service.title} service={service} index={index} />)}</div>
        </div>
      </section>
    </>
  )
}

function AboutPage() {
  return (
    <>
      <PageHero eyebrow="A little about Everwell" title="Dentistry with a softer touch." text="We started Everwell with one simple idea: a visit to the dentist should leave you feeling cared for, not just checked off." />
      <section className="px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-[1120px] items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <img src="https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1200&q=85" alt="Patient smiling during a caring dental visit" loading="lazy" className="h-[330px] w-full rounded-[24px] object-cover sm:h-[450px]" />
          <div><SectionHeading eyebrow="Small details, big difference" title="Your comfort is never an afterthought." text="We’ve created a calm, welcoming space where you can ask questions, take your time, and feel in control of your care. Our team pairs modern dentistry with genuine, human kindness." />
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[['12+', 'years caring for smiles'], ['4.9/5', 'average patient rating'], ['6,000+', 'happy visits and counting'], ['100%', 'care centered on you']].map(([stat, caption]) => <div key={caption} className="rounded-2xl bg-[#f5f7f4] p-4 sm:p-5"><p className="text-2xl font-semibold tracking-tight text-[#168e84]">{stat}</p><p className="mt-1 text-xs leading-5 text-slate-500">{caption}</p></div>)}
            </div>
          </div>
        </div>
      </section>
      <section className="bg-[#142945] px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-[1120px]"><SectionHeading eyebrow="What matters to us" title="Care built around real people." light />
          <div className="mt-9 grid gap-4 sm:grid-cols-3">
            {[['We listen first', 'No rushing, no judgment. Just a proper conversation about what matters to you.', Heart], ['We explain clearly', 'We make sure you understand your options before we make a plan together.', CheckCircle2], ['We keep it personal', 'Familiar faces, thoughtful follow-ups, and care that remembers your name.', Users]].map(([title, text, Icon]) => <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"><Icon size={23} className="text-[#66d1c3]" /><h3 className="mt-5 text-lg font-semibold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-white/55">{text}</p></article>)}
          </div>
        </div>
      </section>
    </>
  )
}

function TeamPage() {
  return (
    <>
      <PageHero eyebrow="People behind your smile" title="A team who treats you like a person." text="Experienced, kind, and always happy to answer one more question. Meet the people looking after your smile." image="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=85" />
      <section className="px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-[1160px]">
          <div className="mb-10"><SectionHeading eyebrow="Meet your care team" title="Good people. Gentle hands." text="We bring experience and a thoughtful approach to every visit. We can't wait to meet you." /></div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((person) => <article key={person.name} className="group overflow-hidden rounded-[22px] bg-[#f5f7f4]">
              <div className="h-[340px] overflow-hidden bg-[#e5ede8]"><img src={person.image} alt={person.name} loading="lazy" className="size-full object-cover object-top transition duration-700 group-hover:scale-[1.03]" /></div>
              <div className="p-5"><h3 className="text-lg font-semibold text-[#142945]">{person.name}</h3><p className="mt-1 text-sm text-slate-500">{person.role}</p><div className="mt-4 flex items-center gap-2 text-xs font-medium text-[#218f83]"><Check size={14} /> Here to make you feel at ease</div></div>
            </article>)}
          </div>
        </div>
      </section>
      <section className="px-5 pb-16 sm:px-8"><div className="mx-auto flex max-w-[1160px] flex-col items-start justify-between gap-6 rounded-[24px] bg-[#eaf6f2] p-7 sm:flex-row sm:items-center sm:p-10"><div><p className="text-xl font-semibold tracking-tight text-[#142945]">Your first visit is a conversation, not a commitment.</p><p className="mt-2 text-sm text-slate-500">Come meet us and see if Everwell feels right for you.</p></div><ButtonLink to="/contact#appointment">Meet the team</ButtonLink></div></section>
    </>
  )
}

function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <>
      <PageHero eyebrow="We’d love to hear from you" title="Let’s make your next visit easy." text="Have a question or ready to book? Get in touch with our friendly team and we’ll help you find a time that works." image="https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1200&q=85" />
      <section className="px-5 py-12 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-[1120px] gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <SectionHeading eyebrow="Come say hello" title="We’re just around the corner." text="Call us, drop by, or send a note. A real person from our team will be happy to help." />
            <div className="mt-8 space-y-5">
              <a href="tel:+12125550148" className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4 hover:border-[#a8dbd2]"><span className="flex size-11 items-center justify-center rounded-full bg-[#eaf6f3] text-[#218f83]"><Phone size={18} /></span><span><span className="block text-xs text-slate-400">Give us a call</span><span className="mt-1 block text-sm font-semibold text-[#142945]">(212) 555-0148</span></span></a>
              <a href="mailto:hello@everwelldental.com" className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4 hover:border-[#a8dbd2]"><span className="flex size-11 items-center justify-center rounded-full bg-[#eaf6f3] text-[#218f83]"><Mail size={18} /></span><span><span className="block text-xs text-slate-400">Send us a note</span><span className="mt-1 block text-sm font-semibold text-[#142945]">hello@everwelldental.com</span></span></a>
              <div className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4"><span className="flex size-11 items-center justify-center rounded-full bg-[#eaf6f3] text-[#218f83]"><MapPin size={18} /></span><span><span className="block text-xs text-slate-400">Come on in</span><span className="mt-1 block text-sm font-semibold text-[#142945]">128 Willow Lane, Brooklyn, NY 11201</span></span></div>
              <div className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4"><span className="flex size-11 items-center justify-center rounded-full bg-[#eaf6f3] text-[#218f83]"><Clock3 size={18} /></span><span><span className="block text-xs text-slate-400">Clinic hours</span><span className="mt-1 block text-sm font-semibold text-[#142945]">Mon – Fri, 8:00 am – 6:00 pm</span></span></div>
            </div>
          </div>
          <div id="appointment" className="scroll-mt-36 rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_22px_65px_-48px_rgba(20,41,69,0.4)] sm:p-9">
            <div className="mb-7"><Eyebrow>Appointment request</Eyebrow><h2 className="text-2xl font-semibold tracking-tight text-[#142945]">Let’s find a time for you.</h2><p className="mt-2 text-sm text-slate-500">Share a few details and we’ll show you the next steps to get in touch.</p></div>
            {submitted ? (
              <div role="status" className="rounded-2xl bg-[#eaf6f3] p-6 text-center">
                <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-white text-[#218f83]"><CheckCircle2 size={25} /></span>
                <h3 className="mt-4 text-lg font-semibold text-[#142945]">Thanks for reaching out!</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">This demo isn’t connected to a booking inbox yet. Please call (212) 555-0148 to confirm your visit.</p>
                <button type="button" onClick={() => setSubmitted(false)} className="mt-4 text-sm font-semibold text-[#188c80] hover:underline">Send another request</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-semibold text-[#34465d]">Your name<input required name="name" autoComplete="name" placeholder="e.g. Alex Morgan" className="form-field mt-2" /></label>
                <label className="text-xs font-semibold text-[#34465d]">Email address<input required name="email" type="email" autoComplete="email" placeholder="alex@example.com" className="form-field mt-2" /></label>
                <label className="text-xs font-semibold text-[#34465d]">Phone number<input required name="phone" type="tel" autoComplete="tel" placeholder="(212) 555-0000" className="form-field mt-2" /></label>
                <label className="text-xs font-semibold text-[#34465d]">What can we help with?<select required name="service" defaultValue="" className="form-field mt-2"><option value="" disabled>Select a service</option>{services.map((service) => <option key={service.title}>{service.title}</option>)}<option>I'm not sure yet</option></select></label>
                <label className="text-xs font-semibold text-[#34465d] sm:col-span-2">Anything else you’d like us to know?<textarea name="message" rows="3" placeholder="Your preferred days or any questions..." className="form-field mt-2 resize-y" /></label>
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#142945] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#20466e] sm:col-span-2">Request an appointment <CalendarDays size={16} /></button>
                <p className="text-center text-[11px] text-slate-400 sm:col-span-2">We’ll only use your details to get back to you about your visit.</p>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

function Footer() {
  return (
    <footer className="bg-[#10223a] px-5 py-12 text-white sm:px-8">
      <div className="mx-auto grid max-w-[1240px] gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr_0.8fr_1fr]">
        <div><Logo light /><p className="mt-4 max-w-xs text-[13px] leading-6 text-white/55">Thoughtful dental care, a softer touch, and a team that’s always happy to see you.</p></div>
        <div><p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-white/40">Explore</p><div className="grid gap-3 text-sm text-white/70"><Link to="/services" className="hover:text-[#75d4c6]">Our services</Link><Link to="/about" className="hover:text-[#75d4c6]">About Everwell</Link><Link to="/team" className="hover:text-[#75d4c6]">Meet the team</Link><Link to="/contact" className="hover:text-[#75d4c6]">Get in touch</Link></div></div>
        <div><p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-white/40">Visit us</p><p className="text-sm leading-6 text-white/70">128 Willow Lane<br />Brooklyn, NY 11201</p><p className="mt-3 text-sm text-white/70">Mon – Fri, 8 am – 6 pm</p></div>
        <div><p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-white/40">Ready when you are</p><p className="mb-4 text-sm leading-6 text-white/70">Questions, checkups, new smiles — we’re here for all of it.</p><ButtonLink to="/contact#appointment">Book a visit</ButtonLink></div>
      </div>
      <div className="mx-auto mt-10 max-w-[1240px] border-t border-white/10 pt-5 text-xs text-white/40">© {currentYear} Everwell Dental. Made with care.</div>
    </footer>
  )
}

function NotFoundPage() {
  return <section className="flex min-h-[55vh] flex-col items-center justify-center px-5 text-center"><p className="text-sm font-semibold uppercase tracking-widest text-[#208e83]">404 · Not found</p><h1 className="mt-3 text-4xl font-semibold text-[#142945]">This page took a wrong turn.</h1><p className="mt-3 text-slate-500">Let’s get you back to where the smiles are.</p><Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#142945] px-6 py-3 text-sm font-semibold text-white">Back home <ArrowRight size={16} /></Link></section>
}

function App() {
  return (
    <div className="min-h-screen bg-white font-sans text-[#142945]">
      <ScrollToTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
