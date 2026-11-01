import { useEffect, useRef, useState } from 'react'
import './App.css'

const clamp01 = (value) => Math.max(0, Math.min(1, value))
const revealPhase = (progress, start, span) => clamp01((progress - start) / span)

function App() {
  const showcaseCards = [
    { id: '3976', image: '/instagram-karusell/IMG_3976.jpg', alt: 'Instagram carousel photo 3976' },
    { id: '3977', image: '/instagram-karusell/IMG_3977.jpg', alt: 'Instagram carousel photo 3977' },
    { id: '3978', image: '/instagram-karusell/IMG_3978.jpg', alt: 'Instagram carousel photo 3978' },
    { id: '3980', image: '/instagram-karusell/IMG_3980.jpg', alt: 'Instagram carousel photo 3980' },
    { id: '3982', image: '/instagram-karusell/IMG_3982.jpg', alt: 'Instagram carousel photo 3982' },
    { id: '3981', image: '/instagram-karusell/IMG_3981.jpg', alt: 'Instagram carousel photo 3981' },
    { id: '3983', image: '/instagram-karusell/IMG_3983.jpg', alt: 'Instagram carousel photo 3983' },
    { id: '3984', image: '/instagram-karusell/IMG_3984.jpg', alt: 'Instagram carousel photo 3984' },
    { id: '3986', image: '/instagram-karusell/IMG_3986.jpg', alt: 'Instagram carousel photo 3986' },
    { id: '3985', image: '/instagram-karusell/IMG_3985.jpg', alt: 'Instagram carousel photo 3985' },
    { id: '3987', image: '/instagram-karusell/IMG_3987.jpg', alt: 'Instagram carousel photo 3987' },
  ]
  const audioRef = useRef(null)
  const presskitSectionRef = useRef(null)
  const showcaseCarouselRef = useRef(null)
  const showcaseDragRef = useRef(null)
  const showcaseLoopRef = useRef(null)
  const suppressShowcaseClickRef = useRef(false)
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

  const startShowcaseDrag = (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return

    const carousel = event.currentTarget
    showcaseDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: carousel.scrollLeft,
      moved: false,
    }
    carousel.setPointerCapture(event.pointerId)
  }

  const moveShowcaseDrag = (event) => {
    const drag = showcaseDragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    if (Math.abs(event.clientX - drag.startX) > 5) drag.moved = true
    event.currentTarget.scrollLeft = drag.scrollLeft + drag.startX - event.clientX
  }

  const endShowcaseDrag = (event) => {
    if (showcaseDragRef.current?.pointerId === event.pointerId) {
      suppressShowcaseClickRef.current = showcaseDragRef.current.moved
      showcaseDragRef.current = null
    }
  }

  const handleShowcaseClick = (event) => {
    if (!suppressShowcaseClickRef.current) return

    event.preventDefault()
    event.stopPropagation()
    suppressShowcaseClickRef.current = false
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
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
    event.currentTarget.scrollLeft += delta
    event.preventDefault()
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

      showcaseLoopRef.current = { start, end: start + width, width }
      carousel.scrollLeft = start + (previousLoop ? (progress / previousLoop.width) * width : 0)
    }

    measureLoop()
    window.addEventListener('resize', measureLoop)

    return () => {
      window.removeEventListener('resize', measureLoop)
    }
  }, [showcaseCards.length])

  const presskitTitleReveal = revealPhase(presskitSectionReveal, 0.02, 0.12)
  const presskitImageReveal = revealPhase(presskitSectionReveal, 0.22, 0.28)
  const presskitCopyReveal = revealPhase(presskitSectionReveal, 0.3, 0.22)

  const presskitTitleStyle = {
    opacity: presskitTitleReveal,
    transform: `translateY(${(1 - presskitTitleReveal) * 18}px)`,
  }

  const presskitImageStyle = {
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
        </div>
      </nav>
      <main className="onepage-layout">
        <section className="hero-section" aria-label="Hero section">
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
            <button className="menu-item">
              <img src="/MENU-ITEM.svg" alt="Menu item 4" />
            </button>
            <button className="menu-item">
              <img src="/MENU-ITEM.svg" alt="Menu item 5" />
            </button>
          </nav>
          <section id="center">
            {/* Din content kommer här */}
          </section>
          <p className="bottom-left-tagline" aria-label="We are a Stockholm-based dj. And a creative collective.">
            <span className="tagline-line tagline-line-1">Stockholm-based djs</span>
            <span className="tagline-line tagline-line-2">and a creative collective.</span>
          </p>
          <div className="hero-social-links">
            <a className="instagram-link" href="https://www.instagram.com/preciouskargo_" target="_blank" rel="noopener noreferrer" aria-label="Open Precious Kargo on Instagram">
              <p className="social-link-label">instagram</p>
              <img className="instagram-image" src="/Insta%20logga%20transparent.PNG" alt="Instagram" />
            </a>
            <a className="email-key-link" href="mailto:precious.kargo.p@gmail.com" aria-label="Email Precious Kargo">
              <p className="social-link-label">mail us</p>
              <img className="email-key-image" src="/Email%20key.png" alt="Email key" />
            </a>
          </div>
        </section>
      <section className="third-section" ref={presskitSectionRef} aria-label="Presskit section">
        <div className="third-layout">
          <aside className="third-static">
            <div className="third-static-inner">
              <h2
                style={presskitTitleStyle}
              >
                about us
              </h2>
              <div
                className="presskit-mini-video-wrap"
                aria-label="Presskit image preview"
                style={presskitImageStyle}
              >
                <img className="presskit-mini-video" src="/P1090348%20(1).jpg" alt="Precious presskit preview" loading="lazy" />
              </div>
              <div
                className="presskit-mini-video-wrap presskit-secondary-image-wrap"
                aria-label="Presskit event photo"
                style={presskitImageStyle}
              >
                <img className="presskit-mini-video" src="/P1070777.JPEG" alt="Precious Kargo event" loading="lazy" />
              </div>
            </div>
          </aside>
          <div
            className="third-scroll"
            style={presskitCopyStyle}
          >
            <div className="presskit-copy-block">
              <p>
                Precious Kargo is a multidisciplinary creative collective operating at the intersection of music, art, and club culture. As producers and DJs, they create high-energy electronic soundscapes where techno, afro house, and melodic club music merge into a contemporary, genre-blurring sonic identity. Influences from breaks, garage, and underground rave culture are woven together with a dreamy, hypnotic, and rhythm-driven atmosphere shaped by the experimental spirit of Stockholm’s underground scene. Every set evolves into a dynamic experience where music, energy and fun remain at the center.
              </p>
            </div>
            <img className="presskit-mobile-image" src="/P1070777.JPEG" alt="Precious Kargo event" loading="lazy" />
            <div className="presskit-copy-block">
              <p>
                Beyond music, Precious Kargo's creative practice extends into the production and curation of cultural and club events, as well as styling and sewing. Through these different forms of expression, the collective continues to explore the relationship between sound, visual identity, and community, creating spaces and experiences rooted in collaboration and experimentation.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="carousel-section" aria-label="Memories section">
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
            onClickCapture={handleShowcaseClick}
            onScroll={(event) => normalizeShowcaseScroll(event.currentTarget)}
            onWheel={handleShowcaseWheel}
          >
            {Array.from({ length: 3 }, (_, copyIndex) =>
              showcaseCards.map((card) => (
                <a
                  className="showcase-card"
                  key={`${copyIndex}-${card.id}`}
                  href="https://www.instagram.com/preciouskargo_"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={copyIndex === 1 ? `View ${card.alt} on Instagram` : undefined}
                  aria-hidden={copyIndex !== 1}
                  tabIndex={copyIndex === 1 ? 0 : -1}
                >
                  <img className="showcase-image" src={card.image} alt={copyIndex === 1 ? card.alt : ''} loading="lazy" draggable="false" />
                </a>
              )),
            )}
          </div>
        </div>
      </section>
      <section className="fourth-section" aria-label="Contact section">
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
          <div className="final-hello-line" aria-label="Say hello to">
            <span className="final-hello-marquee" aria-hidden="true">
              <span className="final-hello-track">
                {Array.from({ length: 12 }).map((_, index) => (
                  <span key={`hello-track-a-${index}`}>SAY HELLO TO</span>
                ))}
              </span>
              <span className="final-hello-track" aria-hidden="true">
                {Array.from({ length: 12 }).map((_, index) => (
                  <span key={`hello-track-b-${index}`}>SAY HELLO TO</span>
                ))}
              </span>
            </span>
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
