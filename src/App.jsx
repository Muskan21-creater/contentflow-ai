import React, { useRef, useState } from "react";
import { toBlob, toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const initialSlides = [
  {
    headline: "Great product ideas don't usually fail because they're bad.",
    body: "They fail because nobody validated them before building.",
    takeaway: "Validate before you build.",
  },
  {
    headline: "Start with the problem, not the solution.",
    body: "Talk to real people and understand what they struggle with before deciding what to build.",
    takeaway: "Problems come before products.",
  },
  {
    headline: "Customer conversations reveal what assumptions miss.",
    body: "Ask users about their behaviour, frustrations and current alternatives instead of asking whether they like your idea.",
    takeaway: "Listen for real behaviour.",
  },
  {
    headline: "Build the smallest possible test.",
    body: "Use a simple prototype, landing page or mockup to learn whether people actually care.",
    takeaway: "Test before you invest.",
  },
  {
    headline: "Look for actions, not compliments.",
    body: "Positive feedback feels good, but genuine interest is shown through behaviour, commitment and repeated use.",
    takeaway: "Behaviour beats opinions.",
  },
  {
    headline: "Let early feedback change the idea.",
    body: "Don't defend your first version. Look for patterns in what users do, say and repeatedly struggle with.",
    takeaway: "Feedback is product research.",
  },
  {
    headline: "Build less. Learn faster.",
    body: "The best founders don't wait until launch to discover what users want.",
    takeaway: "Validate → Learn → Build.",
  },
];

const visualPresets = [
  {
    title: "Dark Editorial",
    description: "Bold, premium and high-contrast.",
    value:
      "Dark editorial design with bold typography, strong contrast, purple accents and a premium social-media-ready composition.",
    theme: {
      background: "#05091a",
      text: "#ffffff",
      muted: "#aeb6cf",
      accent: "#7a6cff",
      line: "rgba(255,255,255,0.14)",
    },
  },
  {
    title: "Minimal Professional",
    description: "Clean, modern and professional.",
    value:
      "Minimal professional design with a clean white background, modern typography, subtle spacing and a polished LinkedIn-friendly appearance.",
    theme: {
      background: "#ffffff",
      text: "#16181f",
      muted: "#6b7080",
      accent: "#4b3bff",
      line: "#e4e5ea",
    },
  },
  {
    title: "Bold & Vibrant",
    description: "Energetic, colourful and engaging.",
    value:
      "Bold and vibrant social-media design with energetic typography, strong visual hierarchy, colourful accents and an engaging Instagram-ready layout.",
    theme: {
      background: "#fff1e8",
      text: "#21130d",
      muted: "#6d5145",
      accent: "#ea580c",
      line: "#f0c7b2",
    },
  },
];

export default function App() {
  const [slides, setSlides] = useState(initialSlides);
  const [activeSlide, setActiveSlide] = useState(0);

  const [idea, setIdea] = useState(
    "I want to create a carousel for founders explaining why great product ideas often fail because people spend too much time building before validating what users actually want. The carousel should explain how founders can validate an idea quickly using customer conversations, simple prototypes and early feedback."
  );

  const [visualDirection, setVisualDirection] = useState(
    visualPresets[0].value
  );

  const [copySuccess, setCopySuccess] = useState(false);
  const [exporting, setExporting] = useState(false);
  const exportRefs = useRef([]);

  const selectedPreset =
    visualPresets.find((preset) => preset.value === visualDirection) ||
    visualPresets[0];
  const currentTheme = selectedPreset.theme;

  const currentSlide = slides[activeSlide];

  const updateCurrentSlide = (field, value) => {
    setSlides((previousSlides) =>
      previousSlides.map((slide, index) =>
        index === activeSlide
          ? { ...slide, [field]: value }
          : slide
      )
    );
  };

  const goToSlide = (index) => {
    setActiveSlide(index);
  };

  const previousSlide = () => {
    setActiveSlide((previous) =>
      previous === 0 ? slides.length - 1 : previous - 1
    );
  };

  const nextSlide = () => {
    setActiveSlide((previous) =>
      previous === slides.length - 1 ? 0 : previous + 1
    );
  };

  const generateCarousel = () => {
    const trimmedIdea = idea.trim();

    if (!trimmedIdea) {
      alert("Please enter an idea first.");
      return;
    }

    setSlides([
      {
        headline: "Start with the insight.",
        body: trimmedIdea,
        takeaway: "Start with the problem worth solving.",
      },
      {
        headline: "Great ideas need validation.",
        body: "Before spending months building, find out whether the problem is real and important to the people you want to serve.",
        takeaway: "Validate assumptions early.",
      },
      {
        headline: "Talk to real users.",
        body: "Customer conversations help you understand real frustrations, behaviours and existing alternatives.",
        takeaway: "Listen before building.",
      },
      {
        headline: "Test the smallest version.",
        body: "Use a prototype, mockup or landing page to learn quickly without investing heavily in a full product.",
        takeaway: "Build less to learn more.",
      },
      {
        headline: "Watch what people do.",
        body: "Compliments are useful, but behaviour and commitment reveal whether people genuinely care about the problem.",
        takeaway: "Behaviour beats opinions.",
      },
      {
        headline: "Use feedback to improve.",
        body: "Early feedback should shape your product instead of simply confirming your first idea.",
        takeaway: "Feedback is product research.",
      },
      {
        headline: "Build less. Learn faster.",
        body: "The strongest products are shaped through validation, learning and iteration before major resources are committed.",
        takeaway: "Validate → Learn → Build.",
      },
    ]);

    setActiveSlide(0);
  };

  const buildCarouselContent = () => {
    return `CONTENTFLOW AI — CAROUSEL CONTENT

VISUAL DIRECTION
${visualDirection}

========================================

${slides
  .map(
    (slide, index) => `SLIDE ${index + 1}

HEADLINE
${slide.headline}

BODY COPY
${slide.body}

KEY TAKEAWAY
${slide.takeaway}`
  )
  .join("\n\n========================================\n\n")}

========================================

Generated with ContentFlow AI
`;
  };

  const copyCarouselContent = async () => {
    try {
      await navigator.clipboard.writeText(buildCarouselContent());

      setCopySuccess(true);

      window.setTimeout(() => {
        setCopySuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Copy failed:", error);

      alert(
        "Unable to copy automatically. Please check your browser permissions."
      );
    }
  };

  const getExportNode = (index) => exportRefs.current[index];

  const waitForExportNodes = () =>
    new Promise((resolve) => window.requestAnimationFrame(resolve));

  const exportSlidesAsPng = async () => {
    try {
      setExporting(true);
      await waitForExportNodes();

      const zip = new JSZip();

      for (let index = 0; index < slides.length; index += 1) {
        const node = getExportNode(index);
        if (!node) continue;

        const blob = await toBlob(node, {
          pixelRatio: 2,
          cacheBust: true,
          backgroundColor: currentTheme.background,
        });

        if (blob) {
          zip.file(
            `contentflow-slide-${String(index + 1).padStart(2, "0")}.png`,
            blob
          );
        }
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, "contentflow-carousel-pngs.zip");
    } catch (error) {
      console.error("PNG export failed:", error);
      alert("Unable to export the PNG slides. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const exportSlidesAsPdf = async () => {
    try {
      setExporting(true);
      await waitForExportNodes();

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [1080, 1350],
        compress: true,
      });

      for (let index = 0; index < slides.length; index += 1) {
        const node = getExportNode(index);
        if (!node) continue;

        const dataUrl = await toPng(node, {
          pixelRatio: 1,
          cacheBust: true,
          backgroundColor: currentTheme.background,
        });

        if (index > 0) {
          pdf.addPage([1080, 1350], "portrait");
        }

        pdf.addImage(dataUrl, "PNG", 0, 0, 1080, 1350);
      }

      pdf.save("contentflow-carousel.pdf");
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("Unable to export the PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        padding: "40px 20px",
      }}
    >
      {/* ================= HEADER ================= */}

      <header
        style={{
          maxWidth: "1200px",
          margin: "0 auto 50px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <p
            style={{
              marginBottom: "8px",
              color: "var(--ac)",
              fontWeight: 800,
              letterSpacing: "0.05em",
              fontSize: "0.8rem",
            }}
          >
            ✦ AI-POWERED CONTENT CREATION
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(2rem, 5vw, 4rem)",
            }}
          >
            ContentFlow AI
          </h1>
        </div>

        <button
          className="btn"
          onClick={() =>
            document
              .getElementById("create-section")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          Create Carousel →
        </button>
      </header>

      {/* ================= HERO ================= */}

      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto 60px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: "var(--ac)",
            fontWeight: 800,
            marginBottom: "15px",
          }}
        >
          AI-POWERED CONTENT CREATION SYSTEM
        </p>

        <h2
          style={{
            fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
            lineHeight: 1,
            marginBottom: "25px",
          }}
        >
          From a rough idea to a{" "}
          <span style={{ color: "var(--ac)" }}>
            ready-to-publish carousel.
          </span>
        </h2>

        <p
          style={{
            color: "var(--mute)",
            fontSize: "1.1rem",
            lineHeight: 1.7,
          }}
        >
          Turn your ideas into structured, editable carousel content for
          LinkedIn and Instagram.
        </p>
      </section>

      {/* ================= MAIN WORKSPACE ================= */}

      <section
        id="create-section"
        className="card"
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "clamp(20px, 4vw, 50px)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(280px, 1fr) minmax(350px, 1.25fr)",
            gap: "40px",
            alignItems: "start",
          }}
        >
          {/* ================= LEFT SIDE ================= */}

          <div>
            <p
              style={{
                color: "var(--ac)",
                fontWeight: 800,
                fontSize: "0.8rem",
                letterSpacing: "0.05em",
              }}
            >
              STEP 1 — FOUNDER INPUT
            </p>

            <h2
              style={{
                fontSize: "2rem",
                marginBottom: "15px",
              }}
            >
              Start with a rough idea.
            </h2>

            <p
              style={{
                color: "var(--mute)",
                lineHeight: 1.7,
                marginBottom: "20px",
              }}
            >
              Enter a thought, insight or topic. The system turns it into a
              structured carousel that you can edit slide by slide.
            </p>

            <textarea
              value={idea}
              onChange={(event) => setIdea(event.target.value)}
              rows={10}
              placeholder="Describe the idea for your carousel..."
            />

            <button
              className="btn"
              onClick={generateCarousel}
              style={{
                width: "100%",
                marginTop: "15px",
                minHeight: "54px",
              }}
            >
              Generate Carousel →
            </button>

            <div
              className="card"
              style={{
                marginTop: "30px",
                padding: "25px",
              }}
            >
              <p
                style={{
                  color: "var(--ac)",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  marginBottom: "10px",
                }}
              >
                EDIT SLIDE {activeSlide + 1}
              </p>

              <h3 style={{ marginBottom: "20px" }}>
                Edit Slide {activeSlide + 1}
              </h3>

              <label
                style={{
                  display: "block",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  marginBottom: "8px",
                }}
              >
                HEADLINE
              </label>

              <textarea
                value={currentSlide.headline}
                onChange={(event) =>
                  updateCurrentSlide("headline", event.target.value)
                }
                rows={3}
                style={{ marginBottom: "20px" }}
              />

              <label
                style={{
                  display: "block",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  marginBottom: "8px",
                }}
              >
                BODY COPY
              </label>

              <textarea
                value={currentSlide.body}
                onChange={(event) =>
                  updateCurrentSlide("body", event.target.value)
                }
                rows={5}
                style={{ marginBottom: "20px" }}
              />

              <label
                style={{
                  display: "block",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  marginBottom: "8px",
                }}
              >
                KEY TAKEAWAY
              </label>

              <input
                value={currentSlide.takeaway}
                onChange={(event) =>
                  updateCurrentSlide("takeaway", event.target.value)
                }
              />
            </div>
          </div>

          {/* ================= RIGHT SIDE ================= */}

          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <div>
                <p
                  style={{
                    color: "var(--ac)",
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    marginBottom: "5px",
                  }}
                >
                  SAMPLE OUTPUT
                </p>

                <h2 style={{ margin: 0 }}>Editable Carousel Preview</h2>
              </div>

              <strong style={{ color: "var(--mute)" }}>
                {activeSlide + 1} of {slides.length}
              </strong>
            </div>

            {/* ================= SLIDE PREVIEW ================= */}

            <div
              className="slide pop"
              key={activeSlide}
              style={{
                minHeight: "560px",
                padding: "clamp(30px, 5vw, 60px)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                background: currentTheme.background,
                color: currentTheme.text,
                transition: "background 0.25s ease, color 0.25s ease",
              }}
            >
              <div>
                <p
                  style={{
                    color: currentTheme.accent,
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                  }}
                >
                  SLIDE {String(activeSlide + 1).padStart(2, "0")}
                </p>

                <div
                  style={{
                    marginTop: "80px",
                  }}
                >
                  <h2
                    style={{
                      color: currentTheme.text,
                      fontSize: "clamp(2.5rem, 5vw, 4.8rem)",
                      lineHeight: 1,
                      maxWidth: "850px",
                      marginBottom: "30px",
                    }}
                  >
                    {currentSlide.headline}
                  </h2>

                  <p
                    style={{
                      color: currentTheme.muted,
                      fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
                      lineHeight: 1.55,
                      maxWidth: "700px",
                    }}
                  >
                    {currentSlide.body}
                  </p>
                </div>
              </div>

              <div
                style={{
                  borderTop: `1px solid ${currentTheme.line}`,
                  paddingTop: "25px",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "20px",
                  alignItems: "center",
                }}
              >
                <strong style={{ color: currentTheme.accent }}>
                  {currentSlide.takeaway}
                </strong>

                <button
                  type="button"
                  onClick={nextSlide}
                  style={{
                    background: "transparent",
                    color: currentTheme.text,
                    border: "none",
                    fontWeight: 800,
                    fontSize: "1rem",
                    cursor: "pointer",
                  }}
                >
                  Swipe →
                </button>
              </div>
            </div>

            {/* ================= SLIDE NUMBERS ================= */}

            <div className="slide-navigation">
              {slides.map((_, index) => (
                <button
                  type="button"
                  key={index}
                  className={`slide-number ${
                    activeSlide === index ? "active" : ""
                  }`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {/* ================= PREVIOUS / NEXT ================= */}

            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "20px",
              }}
            >
              <button
                type="button"
                className="ghost"
                onClick={previousSlide}
              >
                ← Previous
              </button>

              <button
                type="button"
                className="ghost"
                onClick={nextSlide}
              >
                Next →
              </button>
            </div>

            {/* ================= VISUAL DIRECTION ================= */}

            <section className="visual-direction">
              <p
                style={{
                  color: "var(--ac)",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  letterSpacing: "0.05em",
                }}
              >
                DESIGN SYSTEM
              </p>

              <h3>Visual Direction</h3>

              <p>
                Choose a style direction or customise it to define how your
                carousel should look and feel.
              </p>

              <div
                className="visual-presets"
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(170px, 1fr))",
                  gap: "12px",
                  margin: "20px 0",
                }}
              >
                {visualPresets.map((preset) => {
                  const isActive = visualDirection === preset.value;

                  return (
                    <button
                      type="button"
                      key={preset.title}
                      onClick={() => setVisualDirection(preset.value)}
                      style={{
                        textAlign: "left",
                        padding: "16px",
                        borderRadius: "14px",
                        cursor: "pointer",
                        border: isActive
                          ? `2px solid ${preset.theme.accent}`
                          : "1px solid var(--line)",
                        background: isActive
                          ? `${preset.theme.accent}14`
                          : "var(--card)",
                        boxShadow: isActive
                          ? `0 0 0 3px ${preset.theme.accent}22`
                          : "none",
                      }}
                    >
                      <strong
                        style={{
                          display: "block",
                          marginBottom: "6px",
                        }}
                      >
                        {preset.title}
                      </strong>

                      <span
                        style={{
                          color: "var(--mute)",
                          fontSize: "0.85rem",
                        }}
                      >
                        {preset.description}
                      </span>
                    </button>
                  );
                })}
              </div>

              <textarea
                value={visualDirection}
                onChange={(event) =>
                  setVisualDirection(event.target.value)
                }
                placeholder="Choose a style above or write your own visual direction..."
                rows={5}
              />
            </section>

            {/* ================= EXPORT ================= */}

            <section className="export-section">
              <div className="export-info">
                <p
                  style={{
                    color: "var(--ac)",
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    letterSpacing: "0.05em",
                  }}
                >
                  FINAL STEP
                </p>

                <h3>Ready to use your carousel?</h3>

                <p>
                  Export your finished carousel as high-quality PNG images or
                  as a ready-to-share PDF.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  className="export-btn"
                  onClick={exportSlidesAsPng}
                  disabled={exporting}
                >
                  {exporting ? "Exporting..." : "↓ Download PNGs"}
                </button>

                <button
                  type="button"
                  className="ghost"
                  onClick={exportSlidesAsPdf}
                  disabled={exporting}
                >
                  ↓ Download PDF
                </button>

                <button
                  type="button"
                  className="ghost"
                  onClick={copyCarouselContent}
                  disabled={exporting}
                >
                  📋 Copy Content
                </button>
              </div>
            </section>

            {copySuccess && (
              <div className="success-message">
                ✓ Carousel content copied successfully!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= HIDDEN EXPORT CANVAS ================= */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          left: "-20000px",
          top: 0,
          width: "1080px",
          height: "auto",
          pointerEvents: "none",
          opacity: 1,
        }}
      >
        {slides.map((slide, index) => (
          <div
            key={`export-${index}-${slide.headline}`}
            ref={(node) => {
              exportRefs.current[index] = node;
            }}
            style={{
              width: "1080px",
              height: "1350px",
              background: currentTheme.background,
              color: currentTheme.text,
              padding: "100px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              fontFamily: "Instrument Sans, system-ui, sans-serif",
              boxSizing: "border-box",
            }}
          >
            <div>
              <p
                style={{
                  color: currentTheme.accent,
                  fontWeight: 800,
                  fontSize: "26px",
                  letterSpacing: "0.12em",
                  margin: 0,
                }}
              >
                CONTENTFLOW AI • SLIDE {String(index + 1).padStart(2, "0")}
              </p>

              <div style={{ marginTop: "180px" }}>
                <h2
                  style={{
                    color: currentTheme.text,
                    fontSize: "88px",
                    lineHeight: 1.02,
                    letterSpacing: "-0.04em",
                    margin: "0 0 50px",
                    fontFamily: "Bricolage Grotesque, system-ui, sans-serif",
                  }}
                >
                  {slide.headline}
                </h2>

                <p
                  style={{
                    color: currentTheme.muted,
                    fontSize: "38px",
                    lineHeight: 1.5,
                    margin: 0,
                    maxWidth: "820px",
                  }}
                >
                  {slide.body}
                </p>
              </div>
            </div>

            <div
              style={{
                borderTop: `2px solid ${currentTheme.line}`,
                paddingTop: "45px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: "30px",
              }}
            >
              <strong
                style={{
                  color: currentTheme.accent,
                  fontSize: "32px",
                  maxWidth: "760px",
                }}
              >
                {slide.takeaway}
              </strong>

              {index < slides.length - 1 && (
                <span
                  style={{
                    color: currentTheme.text,
                    fontSize: "28px",
                    fontWeight: 800,
                  }}
                >
                  Swipe →
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ================= AI STACK ================= */}

      <section
        style={{
          background: "#111827",
          color: "white",
          marginTop: "80px",
          padding: "80px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <p
            style={{
              color: "#a99cff",
              fontWeight: 800,
            }}
          >
            PROPOSED AI STACK
          </p>

          <h2
            style={{
              fontSize: "clamp(2rem, 5vw, 4rem)",
              marginBottom: "40px",
            }}
          >
            Designed to become an automated workflow.
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
            }}
          >
            {[
              ["AI Research & Writing", "Claude / OpenAI API"],
              ["Visual Generation", "Canva / Figma"],
              ["Workflow Automation", "Make / Zapier / n8n"],
              ["Content Database", "Notion / Airtable"],
            ].map(([title, value]) => (
              <div
                key={title}
                style={{
                  padding: "28px",
                  borderRadius: "20px",
                  background: "#1f2937",
                  border: "1px solid #374151",
                }}
              >
                <p
                  style={{
                    color: "#a99cff",
                    fontWeight: 800,
                  }}
                >
                  {title}
                </p>

                <h3 style={{ color: "white", marginBottom: 0 }}>
                  {value}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}