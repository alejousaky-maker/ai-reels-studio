"""Import the upstream (MIT, Mr omi) DSP / instrument / SFX synthesis kit from engine/audio/template without editing it."""
import sys

from .paths import AUDIO_TEMPLATE

if AUDIO_TEMPLATE not in sys.path:
    sys.path.insert(0, AUDIO_TEMPLATE)

from dsp import *  # noqa: E402,F401,F403
import dsp as _dsp  # noqa: E402
import instruments as I  # noqa: E402,F401
import sfx_gen as S  # noqa: E402,F401

read_wav = _dsp.read_wav
write_wav = _dsp.write_wav
fades = _dsp.fades
