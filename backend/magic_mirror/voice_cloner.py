"""Voice cloning module using Coqui TTS."""

from TTS.api import TTS
import torch


class VoiceCloner:
    """Voice cloning class using XTTS v2 model for multilingual voice cloning."""

    def __init__(self, model_name: str = "tts_models/multilingual/multi-dataset/xtts_v2"):
        """
        Initialize the VoiceCloner with a TTS model.

        Args:
            model_name: Name of the TTS model to use. Defaults to XTTS v2.
                       Downloads model on first run (~2GB).
        """
        device = "cuda" if torch.cuda.is_available() else "cpu"
        self.tts = TTS(model_name).to(device)
        self.device = device

    def clone_to_file(
        self,
        text: str,
        speaker_wav: str,
        output_path: str,
        language: str = "en"
    ) -> None:
        """
        Clone voice and save to file.

        Args:
            text: Text to synthesize.
            speaker_wav: Path to reference audio file (3+ seconds recommended).
            output_path: Path where the output audio will be saved.
            language: Language code (e.g., 'en', 'es', 'fr', 'de', etc.).
        """
        self.tts.tts_to_file(
            text=text,
            speaker_wav=speaker_wav,
            language=language,
            file_path=output_path
        )

    def clone_to_wav(
        self,
        text: str,
        speaker_wav: str,
        language: str = "en"
    ) -> list:
        """
        Clone voice and return audio waveform as amplitude values.

        Args:
            text: Text to synthesize.
            speaker_wav: Path to reference audio file (3+ seconds recommended).
            language: Language code (e.g., 'en', 'es', 'fr', 'de', etc.).

        Returns:
            List of amplitude values representing the audio waveform.
        """
        return self.tts.tts(
            text=text,
            speaker_wav=speaker_wav,
            language=language
        )

