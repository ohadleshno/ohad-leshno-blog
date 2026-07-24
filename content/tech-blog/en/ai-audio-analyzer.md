---
title: "AI Audio Analyzer & Music Transcription Engine"
slug: "ai-audio-analyzer"
excerpt: "Deep learning pipeline for audio signal processing, harmonic chord extraction, and automatic musical transcription."
date: "2026-06-15"
coverImage: "/hero-cover.jpeg"
projectUrl: "https://github.com/ohadleshno"
techStack: ["PyTorch", "Librosa", "FastAPI", "Next.js", "Python"]
language: "en"
---

# System Architecture: AI Audio Analyzer

An end-to-end audio signal processing (DSP) and deep learning architecture for extracting harmonic progressions, beat grids, and automatic musical notation.

## Technical Architecture

```
[Audio Input (WAV/MP3)] -> [Librosa STFT / CQT] -> [PyTorch Harmonic Net] -> [Chord & Rhythm Output]
```

1. **Signal Preprocessing**: Short-Time Fourier Transform (STFT) and Constant-Q Transform (CQT) spectral features.
2. **PyTorch Deep Model**: Convolutional Recurrent Neural Network (CRNN) predicting chord labels across temporal frames.
3. **API Layer**: FastAPI backend delivering low-latency inferences to a responsive Next.js frontend.
