import { useEffect, useRef, useState } from 'react'
import './App.css'

const clamp01 = (value) => Math.max(0, Math.min(1, value))
const revealPhase = (progress, start, span) => clamp01((progress - start) / span)

function App() {
  const showcaseCards = [
    { id: 'a', image: '/instagram-karusell/a.jpeg', alt: 'Showcase slide a' },
    { id: 'b', image: '/instagram-karusell/b.jpeg', alt: 'Showcase slide b' },
    { id: 'c', image: '/instagram-karusell/c.jpeg', alt: 'Showcase slide c' },
    { id: 'd', image: '/instagram-karusell/d.jpeg', alt: 'Showcase slide d' },
    { id: 'e', image: '/instagram-karusell/e.jpeg', alt: 'Showcase slide e' },
    { id: 'f', image: '/instagram-karusell/f.jpeg', alt: 'Showcase slide f' },
    { id: 'h', image: '/instagram-karusell/h.jpeg', alt: 'Showcase slide h' },
    { id: 'i', image: '/instagram-karusell/i.jpeg', alt: 'Showcase slide i' },
    { id: 'j', image: '/instagram-karusell/j.jpeg', alt: 'Showcase slide j' },
    { id: 'k', image: '/instagram-karusell/k.jpeg', alt: 'Showcase slide k' },
    { id: 'l', image: '/instagram-karusell/l.jpeg', alt: 'Showcase slide l' },
    { id: 'm', image: '/instagram-karusell/m.jpeg', alt: 'Showcase slide m' },
    { id: 'n', image: '/instagram-karusell/n.jpeg', alt: 'Showcase slide n' },
    { id: 'o', image: '/instagram-karusell/o.jpeg', alt: 'Showcase slide o' },
    { id: 'p', image: '/instagram-karusell/p.jpeg', alt: 'Showcase slide p' },
    { id: 'q', image: '/instagram-karusell/q.jpeg', alt: 'Showcase slide q' },
    { id: 'r', image: '/instagram-karusell/r.jpeg', alt: 'Showcase slide r' },
    { id: 's', image: '/instagram-karusell/s.jpeg', alt: 'Showcase slide s' },
  ]
  const finalMailRepeatCount = 12

  const audioRef = useRef(null)
  const presskitTitleRef = useRef(null)
  const heroSectionRef = useRef(null)
  const presskitSectionRef = useRef(null)
  const carouselSectionRef = useRef(null)
  const contactSectionRef = useRef(null)
  const [presskitMediaWidth, setPresskitMediaWidth] = useState(null)
  const showcaseCarouselRef = useRef(null)
  const showcaseDragRef = useRef(null)
  const showcasePointerRef = useRef(null)
  const showcasePauseUntilRef = useRef(0)
  const showcaseLoopRef = useRef(null)
  const [copiedContact, setCopiedContact] = useState(null)
  const copiedTimeoutRef = useRef(null)
  const [presskitSectionReveal, setPresskitSectionReveal] = useState(0)

  const startAudio = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.muted = false
    audio.volume = 1
    void audio.play().catch(() => {
      /* autoplay may still be blocked until user interaction */
    })
  }

  const muteAudio = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.muted = true
  }

  const goToRelativeSection = (step) => {
    const sections = [heroSectionRef.current, presskitSectionRef.current, carouselSectionRef.current, contactSectionRef.current].filter(Boolean)

    if (sections.length === 0) return

    const marker = window.scrollY + window.innerHeight * 0.35
    let currentIndex = 0

    sections.forEach((section, index) => {
      if (section.offsetTop <= marker) {
        currentIndex = index
      }
    })

    const targetIndex = Math.min(sections.length - 1, Math.max(0, currentIndex + step))
    sections[targetIndex].scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const startShowcaseDrag = (event) => {
    showcasePointerRef.current = event.pointerId
    showcasePauseUntilRef.current = Number.POSITIVE_INFINITY

    if (event.pointerType !== 'mouse' || event.button !== 0) return

    const carousel = event.currentTarget
    showcaseDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: carousel.scrollLeft,
    }
    carousel.setPointerCapture(event.pointerId)
    event.preventDefault()
  }

  const moveShowcaseDrag = (event) => {
    if (showcasePointerRef.current === event.pointerId) {
      showcasePauseUntilRef.current = Number.POSITIVE_INFINITY
    }

    const drag = showcaseDragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    event.currentTarget.scrollLeft = drag.scrollLeft + drag.startX - event.clientX
  }

  const endShowcaseDrag = (event) => {
    if (showcasePointerRef.current === event.pointerId) {
      showcasePointerRef.current = null
      showcasePauseUntilRef.current = performance.now() + 2500
    }

    if (showcaseDragRef.current?.pointerId === event.pointerId) {
      showcaseDragRef.current = null
    }
  }

  const normalizeShowcaseScroll = (carousel) => {
    const loop = showcaseLoopRef.current
    if (!loop) return

    let scrollLeft = carousel.scrollLeft
    while (scrollLeft < loop.start) scrollLeft += loop.width
    while (scrollLeft >= loop.end) scrollLeft -= loop.width
    if (scrollLeft !== carousel.scrollLeft) carousel.scrollLeft = scrollLeft
  }

  const handleShowcaseWheel = (event) => {
    showcasePauseUntilRef.current = performance.now() + 2500
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
    event.currentTarget.scrollLeft += delta
    event.preventDefault()
  }

  const copyContact = async (key, value) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedContact(key)

      if (copiedTimeoutRef.current !== null) {
        window.clearTimeout(copiedTimeoutRef.current)
      }

      copiedTimeoutRef.current = window.setTimeout(() => {
        setCopiedContact((prev) => (prev === key ? null : prev))
      }, 1500)
    } catch {
      setCopiedContact(null)
    }
  }

  useEffect(() => {
    startAudio()

    const unlockAudio = () => startAudio()
    window.addEventListener('pointerdown', unlockAudio, { once: true })
    window.addEventListener('touchstart', unlockAudio, { once: true })
    window.addEventListener('keydown', unlockAudio, { once: true })
    window.addEventListener('visibilitychange', unlockAudio)

    return () => {
      window.removeEventListener('pointerdown', unlockAudio)
      window.removeEventListener('touchstart', unlockAudio)
      window.removeEventListener('keydown', unlockAudio)
      window.removeEventListener('visibilitychange', unlockAudio)
    }
  }, [])

  useEffect(() => {
    const syncPresskitWidth = () => {
      const title = presskitTitleRef.current
      if (!title) return
      setPresskitMediaWidth(title.getBoundingClientRect().width)
    }

    syncPresskitWidth()
    window.addEventListener('resize', syncPresskitWidth)

    return () => window.removeEventListener('resize', syncPresskitWidth)
  }, [])

  useEffect(() => {
    const updatePresskitSectionReveal = () => {
      const section = presskitSectionRef.current
      if (!section) return

      const rect = section.getBoundingClientRect()
      const viewportHeight = window.innerHeight || 1
      const reveal = 1 - rect.top / viewportHeight

      setPresskitSectionReveal(clamp01(reveal))
    }

    updatePresskitSectionReveal()
    window.addEventListener('scroll', updatePresskitSectionReveal, { passive: true })
    window.addEventListener('resize', updatePresskitSectionReveal)

    return () => {
      window.removeEventListener('scroll', updatePresskitSectionReveal)
      window.removeEventListener('resize', updatePresskitSectionReveal)
    }
  }, [])

  useEffect(() => {
    const carousel = showcaseCarouselRef.current
    if (!carousel) return

    const measureLoop = () => {
      const firstCard = carousel.firstElementChild
      if (!firstCard) return

      const styles = window.getComputedStyle(carousel)
      const gap = Number.parseFloat(styles.columnGap) || 0
      const paddingLeft = Number.parseFloat(styles.paddingLeft) || 0
      const cardWidth = firstCard.getBoundingClientRect().width
      const width = (cardWidth + gap) * showcaseCards.length
      const previousLoop = showcaseLoopRef.current
      const progress = previousLoop
        ? ((carousel.scrollLeft - previousLoop.start) % previousLoop.width + previousLoop.width) % previousLoop.width
        : 0
      const start = paddingLeft + width

      showcaseLoopRef.current = { start, end: start + width, width, stride: cardWidth + gap }
      carousel.scrollLeft = start + (previousLoop ? (progress / previousLoop.width) * width : 0)
    }

    measureLoop()
    window.addEventListener('resize', measureLoop)

    let animationFrameId = 0
    let previousTime = performance.now()
    const cardsPerSecond = 0.12

    const tick = (now) => {
      const deltaSeconds = Math.min((now - previousTime) / 1000, 0.05)
      previousTime = now

      const loop = showcaseLoopRef.current
      if (loop && now >= showcasePauseUntilRef.current && showcasePointerRef.current === null) {
        carousel.scrollLeft += deltaSeconds * loop.stride * cardsPerSecond
        normalizeShowcaseScroll(carousel)
      }

      animationFrameId = window.requestAnimationFrame(tick)
    }

    animationFrameId = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', measureLoop)
    }
  }, [showcaseCards.length])

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current !== null) {
        window.clearTimeout(copiedTimeoutRef.current)
      }
    }
  }, [])

  const presskitTitleReveal = revealPhase(presskitSectionReveal, 0.02, 0.12)
  const presskitImageReveal = revealPhase(presskitSectionReveal, 0.22, 0.28)
  const presskitCopyReveal = revealPhase(presskitSectionReveal, 0.3, 0.22)

  const presskitTitleStyle = {
    opacity: presskitTitleReveal,
    transform: `translateY(${(1 - presskitTitleReveal) * 18}px)`,
  }

  const presskitImageStyle = {
    ...(presskitMediaWidth ? { width: `${presskitMediaWidth}px` } : {}),
    opacity: presskitImageReveal,
    transform: `translateY(${(1 - presskitImageReveal) * 24}px)`,
  }

  const presskitCopyStyle = {
    opacity: 0.35 + 0.65 * presskitCopyReveal,
    transform: `translateY(${(1 - presskitCopyReveal) * 28}px)`,
  }

  return (
    <>
      <audio ref={audioRef} autoPlay loop preload="auto" playsInline src="/catch.mp3" />
      <nav className="retro-nav" aria-label="Top media navigation">
        <div className="retro-nav-row">
          <button type="button" className="retro-chip" aria-label="Play" onClick={startAudio}>PLAY</button>
          <button type="button" className="retro-chip" aria-label="Stop" onClick={muteAudio}>STOP</button>
          <button type="button" className="retro-chip" aria-label="Previous" onClick={() => goToRelativeSection(-1)}>PREV</button>
          <button type="button" className="retro-chip" aria-label="Next" onClick={() => goToRelativeSection(1)}>NEXT</button>
        </div>
      </nav>
      <main className="onepage-layout">
        <section className="hero-section" ref={heroSectionRef} aria-label="Hero section">
          <div className="hero-video-bg" aria-hidden="true">
            <video
              className="hero-video"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              src="/precious-bla.mp4"
            />
          </div>
          <header className="top-logo-wrap" aria-label="Precious Kargo logo">
            <div className="top-logo-sequence" role="img" aria-label="Precious Kargo">
              <img className="top-logo-part top-logo-precious" src="/PRECIOUSKARGO1.svg" alt="" aria-hidden="true" />
              <img className="top-logo-part top-logo-kargo" src="/PRECIOUSKARGO1.svg" alt="" aria-hidden="true" />
            </div>
          </header>
          <nav className="menu-container">
            <button className="menu-item">
              <img src="/MENU-ITEM.svg" alt="Menu item 1" />
            </button>
            <button className="menu-item">
              <img src="/MENU-ITEM.svg" alt="Menu item 2" />
            </button>
            <button className="menu-item">
              <img src="/MENU-ITEM.svg" alt="Menu item 3" />
            </button>
          </nav>
          <section id="center">
            {/* Din content kommer här */}
          </section>
          <p className="bottom-left-tagline" aria-label="We are a Stockholm-based dj. And a creative collective.">
            <span className="tagline-line tagline-line-1">Stockholm-based djs</span>
            <span className="tagline-line tagline-line-2">and a creative collective.</span>
          </p>
          <a className="instagram-link" href="https://www.instagram.com/preciouskargo_" target="_blank" rel="noopener noreferrer" aria-label="Open Precious Kargo on Instagram">
            <img className="instagram-image" src="/Precious-instagram.svg" alt="Precious Instagram" />
            <span className="instagram-handle">@Preciouskargo_</span>
          </a>
        </section>
      <section className="third-section" ref={presskitSectionRef} aria-label="Presskit section">
        <div className="third-layout">
          <aside className="third-static">
            <div className="third-static-inner">
              <h2
                ref={presskitTitleRef}
                style={presskitTitleStyle}
              >
                Precious presskit
              </h2>
              <div
                className="presskit-mini-video-wrap"
                aria-label="Presskit image preview"
                style={presskitImageStyle}
              >
                <img className="presskit-mini-video" src="/jpeg6.jpeg" alt="Precious presskit preview" loading="lazy" />
              </div>
            </div>
          </aside>
          <div
            className="third-scroll"
            style={presskitCopyStyle}
          >
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur gravida justo sed
              vestibulum varius, ut dictum nisl blandit, in tempor lorem ullamcorper.
            </p>
            <p>
              Vivamus vel sem non risus volutpat feugiat. Integer ac lorem in eros volutpat facilisis,
              nec consequat est pulvinar, a ullamcorper justo pretium in.
            </p>
            <p>
              Praesent euismod, nibh at finibus lobortis, urna ipsum pharetra arcu, eget tempor nunc
              lectus id est, sed tincidunt sapien posuere nec.
            </p>
            <p>
              Suspendisse potenti. Donec eget posuere lectus, non luctus lacus; maecenas in arcu sed
              ligula iaculis bibendum, vitae efficitur neque vestibulum.
            </p>
            <p>
              Nulla facilisi. In fringilla sapien quis sem tempor, at accumsan diam vulputate; proin
              malesuada sapien in dui commodo, id pretium lorem pulvinar.
            </p>
            <p>
              Cras interdum, magna non faucibus rhoncus, purus massa mattis lacus, et tempus erat augue
              et sem, in malesuada ligula sagittis ut.
            </p>
          </div>
        </div>
      </section>
      <section className="carousel-section" ref={carouselSectionRef} aria-label="Memories section">
        <p className="archive-title">PRECIOUS MEMORIES</p>
        <div className="showcase-carousel-wrap">
          <div
            ref={showcaseCarouselRef}
            className="showcase-carousel"
            role="region"
            aria-label="Precious memories. Scroll to browse photos."
            tabIndex={0}
            onPointerDown={startShowcaseDrag}
            onPointerMove={moveShowcaseDrag}
            onPointerUp={endShowcaseDrag}
            onPointerCancel={endShowcaseDrag}
            onLostPointerCapture={endShowcaseDrag}
            onScroll={(event) => normalizeShowcaseScroll(event.currentTarget)}
            onWheel={handleShowcaseWheel}
          >
            {Array.from({ length: 3 }, (_, copyIndex) =>
              showcaseCards.map((card) => (
                <div className="showcase-card" key={`${copyIndex}-${card.id}`} aria-hidden={copyIndex !== 1}>
                  <img className="showcase-image" src={card.image} alt={copyIndex === 1 ? card.alt : ''} loading="lazy" />
                </div>
              )),
            )}
          </div>
        </div>
      </section>
      <section className="fourth-section" ref={contactSectionRef} aria-label="Contact section">
        <div className="final-video-bg" aria-hidden="true">
          <video
            className="final-video"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            src="/video1.mp4"
          />
        </div>
        <div className="final-section-inner">
          <div className="final-top-row">
            <p className="final-kicker">Design & sound collective</p>
            <a
              className="final-mail-link"
              href="mailto:preciouskargo@gmail.com"
              aria-label="Email Precious Kargo"
            >
              <span className="final-mail-marquee" aria-hidden="true">
                <span className="final-mail-track">
                  {Array.from({ length: finalMailRepeatCount }).map((_, index) => (
                    <span key={`mail-track-a-${index}`}>SAY HELLO TO</span>
                  ))}
                </span>
                <span className="final-mail-track" aria-hidden="true">
                  {Array.from({ length: finalMailRepeatCount }).map((_, index) => (
                    <span key={`mail-track-b-${index}`}>SAY HELLO TO</span>
                  ))}
                </span>
              </span>
            </a>
          </div>
          <div className="final-middle-row">
            <div className="final-statement" aria-label="Contact labels">
              <p
                className={`final-statement-item ${copiedContact === 'instagram' ? 'is-copied' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => void copyContact('instagram', '@preciouskargo_')}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    void copyContact('instagram', '@preciouskargo_')
                  }
                }}
                aria-label="Instagram, click to copy @preciouskargo_"
              >
                <span className="final-statement-label">Instagram</span>
                <span className="final-statement-hover-mail">@preciouskargo_</span>
                <span className="final-copy-status">{copiedContact === 'instagram' ? 'Copied!' : 'Click to copy'}</span>
              </p>
              <p
                className={`final-statement-item ${copiedContact === 'mail' ? 'is-copied' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => void copyContact('mail', 'PreciousKargo@gmail.com')}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    void copyContact('mail', 'PreciousKargo@gmail.com')
                  }
                }}
                aria-label="Mail, click to copy PreciousKargo@gmail.com"
              >
                <span className="final-statement-label">Mail</span>
                <span className="final-statement-hover-mail">PreciousKargo@gmail.com</span>
                <span className="final-copy-status">{copiedContact === 'mail' ? 'Copied!' : 'Click to copy'}</span>
              </p>
            </div>
          </div>
          <div className="final-brand-line" aria-label="Precious Kargo marquee">
            <span className="final-brand-marquee" aria-hidden="true">
              <span className="final-brand-track">
                <span>PRECIOUS KARGO</span>
                <span>PRECIOUS KARGO</span>
                <span>PRECIOUS KARGO</span>
                <span>PRECIOUS KARGO</span>
                <span>PRECIOUS KARGO</span>
                <span>PRECIOUS KARGO</span>
              </span>
              <span className="final-brand-track" aria-hidden="true">
                <span>PRECIOUS KARGO</span>
                <span>PRECIOUS KARGO</span>
                <span>PRECIOUS KARGO</span>
                <span>PRECIOUS KARGO</span>
                <span>PRECIOUS KARGO</span>
                <span>PRECIOUS KARGO</span>
              </span>
            </span>
          </div>
          <div className="final-footer-row">
            <div className="final-links">
              <a href="/">Privacy policy</a>
            </div>
            <p className="final-copyright">© 2026 Precious Kargo</p>
          </div>
        </div>
      </section>
      </main>
    </>
  )
}

export default App
