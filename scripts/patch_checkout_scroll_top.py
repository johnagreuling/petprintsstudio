#!/usr/bin/env python3
"""Scroll to top of page on step change, so entering checkout lands at
SEE THEM (the top of the content) instead of mid-page at HEAR THEM."""
import pathlib, sys

f = pathlib.Path("app/create/page.tsx")
src = f.read_text()
orig = src

old = """  // [C4f] Mirror creation-step state into cart orderMeta so /cart can forward
  // songGenre, petName, petType, sessionFolder, songAnswers to /api/checkout.
  useEffect(() => {
    setOrderMeta({
      songGenre,
      petName: answers.petName || '',
      petType: answers.petBreed || '',
      sessionFolder,
      songAnswers,
    })
  }, [songGenre, answers.petName, answers.petBreed, sessionFolder, songAnswers, setOrderMeta])"""

new = """  // [C4f] Mirror creation-step state into cart orderMeta so /cart can forward
  // songGenre, petName, petType, sessionFolder, songAnswers to /api/checkout.
  useEffect(() => {
    setOrderMeta({
      songGenre,
      petName: answers.petName || '',
      petType: answers.petBreed || '',
      sessionFolder,
      songAnswers,
    })
  }, [songGenre, answers.petName, answers.petBreed, sessionFolder, songAnswers, setOrderMeta])

  // Scroll to top when step changes so users land at the top of the new step
  // (e.g., Make It Real -> checkout lands at SEE THEM, not mid-page at HEAR THEM)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    }
  }, [step])"""

assert src.count(old) == 1, "anchor drifted"
src = src.replace(old, new)
if src == orig:
    print("No changes"); sys.exit(1)
f.write_text(src)
print(f"Patched {f}, +{len(src)-len(orig)} chars")
