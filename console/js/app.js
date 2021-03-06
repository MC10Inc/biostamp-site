(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    var val = aliases[name];
    return (val && name !== val) ? expandAlias(val) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var process;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("js/app.js", function(exports, require, module) {
"use strict";

var _SensorView = require("js/view/SensorView");

ReactDOM.render(React.createElement(_SensorView.SensorView, null), document.getElementById("mc-content"));

});

require.register("js/util/ECGSignal.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var iirCalc = Fili.CalcCascades(); // eslint-disable-line
var firCalc = Fili.FirCoeffs(); // eslint-disable-line

var ECGSignal = exports.ECGSignal = function () {
  function ECGSignal(rateHz, durationSec) {
    _classCallCheck(this, ECGSignal);

    this.rateHz = rateHz;
    this.nSamples = Math.floor(durationSec * this.rateHz);
    this.samples = [];
    this.ecgFiltered = [];
    this.emgFiltered = [];

    this.ecgFilter = new Fili.FirFilter(firCalc.bandpass({
      order: 250,
      Fs: this.rateHz,
      F1: 2,
      F2: 20
    }));

    this.emgHighpass = new Fili.IirFilter(iirCalc.highpass({
      order: 4,
      characteristic: "butterworth",
      Fs: this.rateHz,
      Fc: 100
    }));

    this.emgEnvelope = new Fili.IirFilter(iirCalc.lowpass({
      order: 2,
      characteristic: "butterworth",
      Fs: this.rateHz,
      Fc: 10
    }));
  }

  _createClass(ECGSignal, [{
    key: "update",
    value: function update(newSamples) {
      this.samples = this.samples.concat(newSamples).slice(-this.nSamples);

      var newEcg = this.ecgFilter.multiStep(newSamples);
      this.ecgFiltered = this.ecgFiltered.concat(newEcg).slice(-this.nSamples);

      var newEmg = this.emgEnvelope.multiStep(this.emgHighpass.multiStep(newSamples).map(Math.abs));
      this.emgFiltered = this.emgFiltered.concat(newEmg).slice(-this.nSamples);
    }
  }]);

  return ECGSignal;
}();

});

require.register("js/util/PPGCalibrate.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _BiostampSensor = BiostampSensor,
    AFE4900OffdacScale = _BiostampSensor.AFE4900OffdacScale,
    AFE4900TIAGain = _BiostampSensor.AFE4900TIAGain;


var TIA_GAINS = [AFE4900TIAGain.TIA_GAIN_10KOHM, AFE4900TIAGain.TIA_GAIN_25KOHM, AFE4900TIAGain.TIA_GAIN_50KOHM, AFE4900TIAGain.TIA_GAIN_100KOHM, AFE4900TIAGain.TIA_GAIN_250KOHM, AFE4900TIAGain.TIA_GAIN_500KOHM, AFE4900TIAGain.TIA_GAIN_1000KOHM, AFE4900TIAGain.TIA_GAIN_1500KOHM, AFE4900TIAGain.TIA_GAIN_2000KOHM];
var TIA_GAIN_MIN = 0;
var TIA_GAIN_MAX = TIA_GAINS.length - 1;
var LED_CURRENT_MIN = 1;
var LED_CURRENT_MAX = 102;

// Time to wait after adjusting settings before checking signal
var ADJUST_DELAY = 0.25;
// Duration to capture for measuring DC level
var DC_LEVEL_WINDOW = 0.25;
// Maximum amplitude of a DC level measurement to be considered stable
var STABLE_MAX_AMPLITUDE = 0.05;
// Number of times we try to measure DC level if amplitude is too high
var STABLE_RETRIES = 5;

// Constant to convert AFE4900 ADC codes to volts at ADC input
var ADC_TO_VOLT = 1.2 / 2097152;

// TIA output voltage must never exceed this value
var TIA_MAX = 1.0;
// The goal of calibration is to bring the DC level as close as possible to target
var TARGET_DC_LEVEL = 0.6 * TIA_MAX;
// TIA gain must be increased if it is below this value
var GAIN_LOW_THRESHOLD = 0.2 * TIA_MAX;
// TIA gain must be decreased if it is above this value
var GAIN_HIGH_THRESHOLD = 0.8 * TIA_MAX;

var RED = "RED";
var IR = "IR";
var PPG = "PPG";

var Calibrator = function () {
  function Calibrator(ui, config) {
    _classCallCheck(this, Calibrator);

    this.ui = ui;
    this.rateHz = 1000000 / config.samplingPeriodUs;
    this.packetHandlers = new Set();
  }

  _createClass(Calibrator, [{
    key: "cancel",
    value: function cancel() {
      this.canceled = true;
    }
  }, {
    key: "handlePacket",
    value: function handlePacket(packet) {
      if (this.canceled) {
        return;
      }
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.packetHandlers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var packetHandler = _step.value;

          var keep = packetHandler(packet);
          if (!keep) {
            this.packetHandlers.delete(packetHandler);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: "capture",
    value: function capture(sampleIndex, duration) {
      var _this = this;

      if (this.canceled) {
        return Promise.reject();
      }
      return new Promise(function (resolve, reject) {
        var samples = [];
        var count = Math.floor(_this.rateHz * duration);
        var packetHandler = function packetHandler(packet) {
          if (_this.canceled) {
            reject();
            return false;
          }
          for (var i = 0; i < packet.length; i++) {
            samples.push(packet[i][sampleIndex] * ADC_TO_VOLT);
            if (samples.length === count) {
              break;
            }
          }
          if (samples.length === count) {
            resolve(samples);
            return false;
          }
          return true;
        };
        _this.packetHandlers.add(packetHandler);
      });
    }
  }, {
    key: "measureIndex",
    value: function measureIndex(sampleIndex) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        var tryMeasure = function tryMeasure(retries) {
          return _this2.capture(sampleIndex, DC_LEVEL_WINDOW).then(function (samples) {
            var s = nj.array(samples);
            var max = s.max();
            var min = s.min();
            if (max - min < STABLE_MAX_AMPLITUDE) {
              resolve({
                min: min,
                max: max,
                dc: s.mean()
              });
            } else {
              if (retries === 0) {
                reject("DC level did not stabilize");
              } else {
                return tryMeasure(retries - 1);
              }
            }
          });
        };
        return _this2.capture(sampleIndex, ADJUST_DELAY).then(function (s) {
          return tryMeasure(STABLE_RETRIES);
        });
      });
    }
  }, {
    key: "calibrateChannel",
    value: function calibrateChannel(ch) {
      var _this3 = this;

      return this.calibrateTiaGain(ch).then(function () {
        return _this3.calibrateLedCurrent(ch);
      });
    }

    // Try to set the TIA gain so the DC level is close to or above the target
    // level. If doNotIncrease is set, the gain will only be decreased in order
    // to avoid getting stuck in a loop.

  }, {
    key: "calibrateTiaGain",
    value: function calibrateTiaGain(ch, doNotIncrease) {
      var _this4 = this;

      return this.measure(ch).then(function (stat) {
        if (stat.dc < TARGET_DC_LEVEL) {
          if (doNotIncrease || _this4.gain(ch) === TIA_GAIN_MAX) {
            // Gain is already at max or we are not increasing; make no further
            // adjustment
            return Promise.resolve();
          } else {
            // Increase gain to the next step
            return _this4.adjust(ch, _this4.gain(ch) + 1, _this4.current(ch)).then(function () {
              return _this4.calibrateTiaGain(ch);
            });
          }
        } else {
          // Gain is above the target level. Is it too high?
          if (stat.dc > GAIN_HIGH_THRESHOLD) {
            if (_this4.gain(ch) === TIA_GAIN_MIN) {
              // Gain is already at lowest level, cannot decrease further
              return Promise.resolve();
            } else {
              // Gain is too high, decrease it and do not increase again
              return _this4.adjust(ch, _this4.gain(ch) - 1, _this4.current(ch)).then(function () {
                return _this4.calibrateTiaGain(ch, true);
              });
            }
          } else {
            // Gain is above target but in acceptable range, we are done.
            return Promise.resolve();
          }
        }
      });
    }

    // Try to set the LED current so the DC level is as close as possible to the target

  }, {
    key: "calibrateLedCurrent",
    value: function calibrateLedCurrent(ch) {
      var _this5 = this;

      return this.measure(ch).then(function (stat) {
        if (stat.dc < TARGET_DC_LEVEL && _this5.current(ch) < LED_CURRENT_MAX) {
          // If the DC level is below the target and the current can be
          // increased, then increase it.
          return _this5.increaseLedCurrent(ch);
        } else if (stat.dc >= TARGET_DC_LEVEL && _this5.current(ch) > LED_CURRENT_MIN) {
          // If the DC level is above the target and the current can be
          // decreased, then decreased it.
          return _this5.decreaseLedCurrent(ch);
        } else {
          return Promise.resolve();
        }
      });
    }

    // Increase the LED current to try to bring the DC level closer to the
    // target. Assumes that the LED current can be increased. The DC level is
    // increased until it overshoots.

  }, {
    key: "increaseLedCurrent",
    value: function increaseLedCurrent(ch) {
      var _this6 = this;

      return this.adjust(ch, this.gain(ch), this.current(ch) + 1).then(function () {
        return _this6.measure(ch);
      }).then(function (stat) {
        if (stat.dc < TARGET_DC_LEVEL && _this6.current(ch) < LED_CURRENT_MAX) {
          return _this6.increaseLedCurrent(ch);
        } else {
          return Promise.resolve();
        }
      });
    }

    // Decrease the LED current to try to bring the DC level closer to the
    // target. Assumes that the LED current can be decreased. The DC level is
    // decreased until it undershoots.

  }, {
    key: "decreaseLedCurrent",
    value: function decreaseLedCurrent(ch) {
      var _this7 = this;

      return this.adjust(ch, this.gain(ch), this.current(ch) - 1).then(function () {
        return _this7.measure(ch);
      }).then(function (stat) {
        if (stat.dc > TARGET_DC_LEVEL && _this7.current(ch) > LED_CURRENT_MIN) {
          return _this7.decreaseLedCurrent(ch);
        } else {
          return Promise.resolve();
        }
      });
    }
  }]);

  return Calibrator;
}();

var SpO2Calibrator = exports.SpO2Calibrator = function (_Calibrator) {
  _inherits(SpO2Calibrator, _Calibrator);

  function SpO2Calibrator() {
    _classCallCheck(this, SpO2Calibrator);

    return _possibleConstructorReturn(this, (SpO2Calibrator.__proto__ || Object.getPrototypeOf(SpO2Calibrator)).apply(this, arguments));
  }

  _createClass(SpO2Calibrator, [{
    key: "start",
    value: function start() {
      var _this9 = this;

      this.ui.setPhotodiodeDisconnect(false);
      // Do not use the offset DAC for SpO2
      this.ui.setOffdacCurrent(0);
      this.ui.setOffdacCurrentIr(0);

      // First set both TIA gains to a low value 25k and both LEDs to 2.4mA. We
      // start at a low gain because we need to ensure that neither channel is
      // ever saturated.
      this.adjust(RED, 1, 12).then(function () {
        return _this9.adjust(IR, 1, 12);
      }).then(function () {
        return _this9.calibrateChannel(RED);
      }).then(function () {
        return _this9.calibrateChannel(IR);
      }).then(function () {
        _this9.ui.calibrateDone();
      }).catch(function (error) {
        console.error(error);
        _this9.ui.calibrateDone();
      });
    }
  }, {
    key: "measure",
    value: function measure(ch) {
      if (ch === RED) {
        return this.measureIndex(0);
      } else if (ch === IR) {
        return this.measureIndex(1);
      }
    }
  }, {
    key: "current",
    value: function current(ch) {
      if (ch === RED) {
        return this.currentRed;
      } else if (ch === IR) {
        return this.currentIr;
      }
    }
  }, {
    key: "gain",
    value: function gain(ch) {
      if (ch === RED) {
        return this.gainRed;
      } else if (ch === IR) {
        return this.gainIr;
      }
    }
  }, {
    key: "adjust",
    value: function adjust(ch, gain, current) {
      if (ch === RED) {
        this.gainRed = gain;
        this.currentRed = current;
      } else if (ch === IR) {
        this.gainIr = gain;
        this.currentIr = current;
      }
      this.ui.setLedCurrent(this.currentRed);
      this.ui.setLedCurrentIr(this.currentIr);
      this.ui.setTiaGainValue(TIA_GAINS[this.gainRed]);
      this.ui.setTiaGainIrValue(TIA_GAINS[this.gainIr]);
      return this.ui.applyConfig();
    }
  }]);

  return SpO2Calibrator;
}(Calibrator);

var PPGCalibrator = exports.PPGCalibrator = function (_Calibrator2) {
  _inherits(PPGCalibrator, _Calibrator2);

  function PPGCalibrator() {
    _classCallCheck(this, PPGCalibrator);

    return _possibleConstructorReturn(this, (PPGCalibrator.__proto__ || Object.getPrototypeOf(PPGCalibrator)).apply(this, arguments));
  }

  _createClass(PPGCalibrator, [{
    key: "start",
    value: function start() {
      var _this11 = this;

      this.ui.setPhotodiodeDisconnect(false);
      this.ui.setOffdacCurrent(0);

      this.adjust(PPG, 1, 12).then(function () {
        return _this11.calibrateChannel(PPG);
      }).then(function () {
        _this11.ui.calibrateDone();
      }).catch(function (error) {
        console.error(error);
        _this11.ui.calibrateDone();
      });
    }
  }, {
    key: "measure",
    value: function measure(ch) {
      if (ch === PPG) {
        return this.measureIndex(0);
      }
    }
  }, {
    key: "current",
    value: function current(ch) {
      if (ch === PPG) {
        return this.currentPpg;
      }
    }
  }, {
    key: "gain",
    value: function gain(ch) {
      if (ch === PPG) {
        return this.gainPpg;
      }
    }
  }, {
    key: "adjust",
    value: function adjust(ch, gain, current) {
      if (ch === PPG) {
        this.gainPpg = gain;
        this.currentPpg = current;
      }
      this.ui.setLedCurrent(this.currentPpg);
      this.ui.setTiaGainValue(TIA_GAINS[this.gainPpg]);
      return this.ui.applyConfig();
    }
  }]);

  return PPGCalibrator;
}(Calibrator);

});

require.register("js/util/PPGSignal.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var iirCalc = Fili.CalcCascades(); // eslint-disable-line
var firCalc = Fili.FirCoeffs(); // eslint-disable-line

function peakToPeak(s) {
  return s.max() - s.min();
}

function rms(s) {
  return Math.sqrt(s.subtract(s.mean()).pow(2).mean());
}

var PPGSignal = exports.PPGSignal = function () {
  function PPGSignal(rateHz, durationSec, winSec, filterType) {
    _classCallCheck(this, PPGSignal);

    this.rateHz = rateHz;
    this.nSamples = Math.floor(durationSec * this.rateHz);
    this.calcWin = Math.floor(winSec * this.rateHz);
    this.samples = [];
    this.smoothed = [];

    if (filterType === "spo2") {
      this.ppgBandpassFilter = new Fili.FirFilter(firCalc.bandpass({
        order: 500,
        Fs: this.rateHz,
        F1: 0.5,
        F2: 5
      }));
    } else if (filterType === "ppg") {
      this.ppgBandpassFilter = new Fili.FirFilter(firCalc.bandpass({
        order: 500,
        Fs: this.rateHz,
        F1: 0.5,
        F2: 10
      }));
    } else {
      throw "Invalid filter type";
    }

    this.ppgDcLevelFilter = new Fili.IirFilter(iirCalc.lowpass({
      order: 3,
      characteristic: "butterworth",
      Fs: this.rateHz,
      Fc: 0.3
    }));
  }

  _createClass(PPGSignal, [{
    key: "update",
    value: function update(newSamples) {
      var newSmoothed = this.ppgBandpassFilter.multiStep(newSamples);
      this.samples = this.samples.concat(newSamples).slice(-this.nSamples);
      this.smoothed = this.smoothed.concat(newSmoothed).slice(-this.nSamples);

      var dcSamples = this.ppgDcLevelFilter.multiStep(newSamples);
      this.dcLevel = dcSamples[dcSamples.length - 1];

      var win = nj.array(this.smoothed.slice(-this.calcWin));
      this.peakToPeak = peakToPeak(win);
      this.rms = rms(win);
    }
  }, {
    key: "describe",
    value: function describe() {
      var values = [];

      values.push(["DC", this.dcLevel]);
      values.push(["P-P", this.peakToPeak]);
      values.push(["RMS", this.rms]);

      return values.map(function (v) {
        return v[0] + ":" + v[1].toFixed(0).padStart(8, " ");
      }).join("   ");
    }
  }]);

  return PPGSignal;
}();

});

require.register("js/util/SensorConfig.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _mc$ui$colors = mc.ui.colors,
    BLUE = _mc$ui$colors.BLUE,
    GRAY = _mc$ui$colors.GRAY,
    GREEN = _mc$ui$colors.GREEN,
    HOT_BLUE = _mc$ui$colors.HOT_BLUE,
    HOT_PINK = _mc$ui$colors.HOT_PINK,
    NAVY = _mc$ui$colors.NAVY,
    ORANGE = _mc$ui$colors.ORANGE,
    PINK = _mc$ui$colors.PINK,
    PURPLE = _mc$ui$colors.PURPLE,
    RED = _mc$ui$colors.RED,
    TEAL = _mc$ui$colors.TEAL,
    TURQUOISE = _mc$ui$colors.TURQUOISE;
var _BiostampSensor = BiostampSensor,
    AD5940Mode = _BiostampSensor.AD5940Mode,
    AFE4900Color = _BiostampSensor.AFE4900Color,
    AFE4900Photodiode = _BiostampSensor.AFE4900Photodiode,
    AFE4900ECGGain = _BiostampSensor.AFE4900ECGGain,
    AFE4900Mode = _BiostampSensor.AFE4900Mode,
    EnvironmentMode = _BiostampSensor.EnvironmentMode,
    MotionMode = _BiostampSensor.MotionMode,
    MotionRotationType = _BiostampSensor.MotionRotationType;

var SensorConfig = exports.SensorConfig = function () {
  function SensorConfig() {
    _classCallCheck(this, SensorConfig);

    this.recordingEnabled = false;

    this.features = [{
      id: "motion",
      name: "Motion",
      opts: [{
        key: "mode",
        values: [MotionMode.ACCEL, MotionMode.ACCEL_GYRO, MotionMode.COMPASS, MotionMode.ROTATION],
        tx: function tx(n) {
          return ["Accel", "Accel + Gyro", "Compass", "Rotation"][n - 1];
        }
      }, {
        key: "samplingPeriodUs",
        values: [100000, 50000, 32000, 25000, 16000, 12500, 8000, 6250],
        tx: function tx(n) {
          return 1000000 / n + "Hz";
        }
      }, {
        key: "accelGRange",
        values: [2, 4, 8, 16],
        tx: function tx(n) {
          return "+/-" + n + "G";
        },
        use: function use(value) {
          return value.mode === MotionMode.ACCEL || value.mode === MotionMode.ACCEL_GYRO;
        }
      }, {
        key: "gyroDpsRange",
        values: [250, 500, 1000, 2000],
        tx: function tx(n) {
          return "+/-" + n + "˚/s";
        },
        use: function use(value) {
          return value.mode === MotionMode.ACCEL_GYRO;
        }
      }, {
        key: "rotationType",
        values: [MotionRotationType.ROT_ACCEL_GYRO, MotionRotationType.ROT_ACCEL_GYRO_MAG, MotionRotationType.ROT_ACCEL_MAG],
        tx: function tx(n) {
          return ["Accel/Gyro", "Accel/Mag", "Accel/Gyro/Mag"][n - 1];
        },
        use: function use(value) {
          return value.mode === MotionMode.ROTATION;
        }
      }],
      value: {
        mode: BiostampSensor.MotionMode.ACCEL_GYRO,
        rotationType: BiostampSensor.MotionRotationType.ROT_ACCEL_GYRO,
        samplingPeriodUs: 8000,
        accelGRange: 16,
        gyroDpsRange: 500
      },
      engaged: true,
      signals: function signals(value) {
        switch (value.mode) {
          case MotionMode.ACCEL:
            return [[{ label: "Accel X", color: RED }, { label: "Accel Y", color: BLUE }, { label: "Accel Z", color: GREEN }]];
          case MotionMode.ACCEL_GYRO:
            return [[{ label: "Accel X", color: RED }, { label: "Accel Y", color: BLUE }, { label: "Accel Z", color: GREEN }], [{ label: "Gyro X", color: RED }, { label: "Gyro Y", color: BLUE }, { label: "Gyro Z", color: GREEN }]];
          case MotionMode.COMPASS:
            return [[{ label: "X", color: RED }, { label: "Y", color: BLUE }, { label: "Z", color: GREEN }]];
          case MotionMode.ROTATION:
            return [[{ label: "W", color: TURQUOISE }, { label: "X", color: RED }, { label: "Y", color: BLUE }, { label: "Z", color: GREEN }]];
        }
      },
      parse: function parse(value, idx) {
        return function (packet) {
          if (value.mode === MotionMode.ACCEL_GYRO) {
            return idx === 0 ? packet.slice(0, 3) : packet.slice(3);
          }

          return packet;
        };
      }
    }, {
      id: "afe4900",
      name: "AFE",
      opts: [{
        key: "mode",
        values: [AFE4900Mode.ECG, AFE4900Mode.PPG, AFE4900Mode.PTT, AFE4900Mode.SPO2],
        tx: function tx(n) {
          return ["ECG", "PPG", "PTT", "SpO2"][n - 1];
        }
      }, {
        key: "samplingPeriodUs",
        values: [10000, 4000, 2000, 1000],
        tx: function tx(n) {
          return 1000000 / n + "Hz";
        }
      }, {
        key: "ecgGain",
        values: [AFE4900ECGGain.GAIN_2, AFE4900ECGGain.GAIN_3, AFE4900ECGGain.GAIN_4, AFE4900ECGGain.GAIN_5, AFE4900ECGGain.GAIN_6, AFE4900ECGGain.GAIN_9, AFE4900ECGGain.GAIN_12],
        tx: function tx(n) {
          return "Gain " + [2, 3, 4, 5, 6, 9, 12][n - 1];
        },
        use: function use(value) {
          return value.mode !== AFE4900Mode.PPG && value.mode !== AFE4900Mode.SPO2;
        }
      }, {
        key: "color",
        values: [AFE4900Color.GREEN, AFE4900Color.RED, AFE4900Color.INFRARED],
        tx: function tx(n) {
          return ["Green", "Red", "Infrared"][n - 1];
        },
        use: function use(value) {
          return value.mode !== AFE4900Mode.ECG && value.mode !== AFE4900Mode.SPO2;
        }
      }],
      value: {
        mode: AFE4900Mode.ECG,
        ecgGain: AFE4900ECGGain.GAIN_2,
        color: AFE4900Color.RED,
        photodiode: AFE4900Photodiode.PD1,
        samplingPeriodUs: 4000
      },
      engaged: true
    }, {
      id: "environment",
      name: "Environment",
      opts: [{
        key: "samplingPeriodUs",
        values: [1000000, 500000, 200000, 100000],
        tx: function tx(n) {
          return 1000000 / n + "/s";
        }
      }],
      value: {
        mode: EnvironmentMode.ALL,
        samplingPeriodUs: 200000
      },
      engaged: false,
      signals: function signals(value) {
        return [[{ label: "Pascals", color: TURQUOISE }], [{ label: "Degrees (C)", color: HOT_BLUE }]];
      },
      parse: function parse(value, idx) {
        return function (packet) {
          switch (idx) {
            case 0:
              return packet.pascals;
            case 1:
              return packet.temperatureC;
          }
        };
      }
    }, {
      id: "ad5940",
      name: "Bioimpedance",
      opts: [],
      value: {
        mode: AD5940Mode.EDA
      },
      engaged: false,
      signals: function signals(value) {
        return [[{ label: "Ohms", color: HOT_PINK }], [{ label: "Radians", color: PINK }]];
      },
      parse: function parse(value, idx) {
        return function (packet) {
          return idx === 0 ? packet.zMag || 0 : packet.zPhase || 0;
        };
      }
    }];
  }

  _createClass(SensorConfig, [{
    key: "getFeature",
    value: function getFeature(id) {
      return this.features.find(function (f) {
        return f.id === id;
      });
    }
  }, {
    key: "setRecordingEnabled",
    value: function setRecordingEnabled(enabled) {
      this.recordingEnabled = enabled;

      return this;
    }
  }, {
    key: "toggleFeature",
    value: function toggleFeature(id, engaged) {
      this.getFeature(id).engaged = engaged;

      return this;
    }
  }, {
    key: "editFeature",
    value: function editFeature(id, key, value) {
      this.getFeature(id).value[key] = parseInt(value);

      return this;
    }
  }, {
    key: "isEngaged",
    value: function isEngaged(id) {
      return this.getFeature(id).engaged;
    }
  }, {
    key: "isRecordingEnabled",
    value: function isRecordingEnabled() {
      return this.recordingEnabled;
    }
  }, {
    key: "isValid",
    value: function isValid() {
      return this.features.some(function (f) {
        return f.engaged;
      });
    }
  }, {
    key: "encode",
    value: function encode() {
      var recordingEnabled = this.recordingEnabled;
      var features = this.features.filter(function (f) {
        return f.engaged;
      });
      var encoded = features.map(function (f) {
        return _defineProperty({}, f.id, f.value);
      });

      return Object.assign.apply(null, [{ recordingEnabled: recordingEnabled }].concat(encoded));
    }
  }, {
    key: "restore",
    value: function restore(encoded) {
      var _this = this;

      this.recordingEnabled = encoded.recordingEnabled;

      Object.keys(encoded).forEach(function (key) {
        var feature = _this.getFeature(key);

        if (feature) {
          feature.engaged = false;

          if (encoded[key] !== undefined) {
            feature.engaged = true;
            feature.value = encoded[key];
          }
        }
      });

      return this;
    }
  }]);

  return SensorConfig;
}();

;

});

require.register("js/view/DatabaseView.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _mc$widgets = mc.widgets,
    Table = _mc$widgets.Table,
    IconButton = _mc$widgets.IconButton;

var DatabaseView = exports.DatabaseView = function (_React$Component) {
  _inherits(DatabaseView, _React$Component);

  function DatabaseView(props) {
    _classCallCheck(this, DatabaseView);

    var _this = _possibleConstructorReturn(this, (DatabaseView.__proto__ || Object.getPrototypeOf(DatabaseView)).call(this, props));

    _this.state = {
      recordings: [],
      sortKey: "timestampStart",
      sortDirection: -1
    };
    return _this;
  }

  _createClass(DatabaseView, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.loadRecordings();
    }
  }, {
    key: "loadRecordings",
    value: function loadRecordings() {
      var _this2 = this;

      var db = this.props.db;


      db.list().then(function (recordings) {
        _this2.setState({ recordings: recordings });
      });
    }
  }, {
    key: "deleteRecording",
    value: function deleteRecording(rec) {
      var _this3 = this;

      var db = this.props.db;


      mc.ui.alert("Clear this download from the local database?", {
        level: "warn",
        mode: "confirm",
        onHide: function onHide(confirmed) {
          if (confirmed) {
            db.delete(rec.serial, rec.recordingId).then(function () {
              _this3.loadRecordings();
            });
          }
        }
      });
    }
  }, {
    key: "deleteAllRecordings",
    value: function deleteAllRecordings(rec) {
      var _this4 = this;

      var db = this.props.db;


      mc.ui.alert("Clear ALL downloads from the local database?", {
        level: "warn",
        mode: "confirm",
        onHide: function onHide(confirmed) {
          if (confirmed) {
            db.deleteAll().then(function () {
              _this4.loadRecordings();
            });
          }
        }
      });
    }
  }, {
    key: "sortTable",
    value: function sortTable(sortKey, sortDirection) {
      this.setState({ sortKey: sortKey, sortDirection: sortDirection });
    }
  }, {
    key: "render",
    value: function render() {
      var _this5 = this;

      var _state = this.state,
          recordings = _state.recordings,
          sortKey = _state.sortKey,
          sortDirection = _state.sortDirection;


      var cols = [{
        prop: "timestampStart",
        label: "Date/Time",
        content: function content(rec) {
          return mc.format.datetime(rec.recInfo.timestampStart * 1000);
        },
        sort: true
      }, {
        prop: "recordingId",
        label: "Recording ID",
        sort: true
      }, {
        prop: "serial",
        label: "Sensor",
        sort: ["serial", "timestampStart"]
      }, {
        prop: "durationSec",
        label: "Duration",
        content: function content(rec) {
          return mc.format.interval(rec.recInfo.durationSec * 1000);
        },
        sort: true
      }, {
        prop: "sizeBytes",
        label: "Bytes",
        content: function content(rec) {
          return mc.format.filesize(rec.recInfo.sizeBytes);
        },
        sort: true
      }, {
        prop: "pages",
        label: "Pages Received",
        content: function content(rec) {
          return rec.pagesDownloaded + " / " + rec.numPages;
        }
      }, {
        prop: "clear",
        label: "Clear",
        content: function content(rec) {
          return React.createElement(IconButton, {
            icon: "./img/icon.clear.svg",
            label: "Clear",
            scale: 0.8,
            onPress: _this5.deleteRecording.bind(_this5, rec) });
        }
      }];

      return React.createElement(
        "div",
        { className: "eng-rec-view" },
        React.createElement(
          "h1",
          null,
          "DB"
        ),
        React.createElement(Table, {
          data: recordings,
          cols: cols,
          sort: sortKey,
          direction: sortDirection,
          align: "middle",
          onSort: this.sortTable.bind(this) }),
        recordings.length ? React.createElement(
          "div",
          { style: { textAlign: "center", margin: "2em" } },
          React.createElement(
            "button",
            { className: "mc-button", onClick: this.deleteAllRecordings.bind(this) },
            "Clear All"
          )
        ) : null
      );
    }
  }]);

  return DatabaseView;
}(React.Component);

});

require.register("js/view/DebugView.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var IconButton = mc.widgets.IconButton;

var DebugView = exports.DebugView = function (_React$Component) {
  _inherits(DebugView, _React$Component);

  function DebugView(props) {
    _classCallCheck(this, DebugView);

    var _this = _possibleConstructorReturn(this, (DebugView.__proto__ || Object.getPrototypeOf(DebugView)).call(this, props));

    _this.state = {
      faultLogs: [],
      debugInfo: {},
      resetReason: "?",
      busy: false
    };
    return _this;
  }

  _createClass(DebugView, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this2 = this;

      var sensor = this.props.sensor;


      sensor.getSystemStatus().then(function (status) {
        sensor.getFaultLogs().then(function (faultLogs) {
          sensor.getRTOSDebugInfo().then(function (debugInfo) {
            _this2.setState({
              faultLogs: faultLogs,
              debugInfo: debugInfo,
              resetReason: status.resetReason || "?"
            });
          });
        });
      });
    }
  }, {
    key: "simulateFault",
    value: function simulateFault(type) {
      var _props = this.props,
          sensor = _props.sensor,
          onBusy = _props.onBusy;


      this.setState({ busy: true });

      onBusy(true, "Simulating fault ...");

      sensor.simulateFault(type);
    }
  }, {
    key: "copyText",
    value: function copyText(txt) {
      mc.ui.spin(1, "Copied");

      navigator.clipboard.writeText(txt).then(function () {
        mc.ui.spin(0);
      });
    }
  }, {
    key: "copyFaults",
    value: function copyFaults() {
      var faultLogs = this.state.faultLogs;


      navigator.clipboard.writeText(JSON.stringify(faultLogs, null, 2)).then(function () {
        mc.ui.alert("Copied!");
      });
    }
  }, {
    key: "clearFaults",
    value: function clearFaults() {
      var _this3 = this;

      var _props2 = this.props,
          sensor = _props2.sensor,
          onBusy = _props2.onBusy;


      this.setState({ busy: true });

      sensor.clearFaultLogs().then(function () {
        _this3.setState({
          faultLogs: [],
          busy: false
        });
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this4 = this;

      var sensor = this.props.sensor;
      var _state = this.state,
          faultLogs = _state.faultLogs,
          debugInfo = _state.debugInfo,
          resetReason = _state.resetReason,
          busy = _state.busy;


      var faultTypes = BiostampSensor.SimulateFaultType;
      var faultTxt = JSON.stringify(faultLogs, null, 2);
      var debugTxt = JSON.stringify(debugInfo, null, 2);

      return React.createElement(
        "div",
        null,
        React.createElement(
          "h1",
          null,
          sensor.serial
        ),
        React.createElement(
          "section",
          null,
          React.createElement(
            "h2",
            null,
            "Reset Reason"
          ),
          React.createElement(
            "pre",
            null,
            resetReason
          )
        ),
        React.createElement(
          "section",
          null,
          React.createElement(
            "h2",
            null,
            "Fault Logs"
          ),
          React.createElement(
            "div",
            { className: "eng-debug-tasks" },
            React.createElement(
              "button",
              { onClick: this.copyText.bind(this, faultTxt), disabled: busy },
              "Copy"
            ),
            React.createElement(
              "button",
              { onClick: this.clearFaults.bind(this), disabled: busy },
              "Clear"
            )
          ),
          React.createElement(
            "pre",
            null,
            faultTxt
          )
        ),
        React.createElement(
          "section",
          null,
          React.createElement(
            "h2",
            null,
            "RTOS Debug Info"
          ),
          React.createElement(
            "div",
            { className: "eng-debug-tasks" },
            React.createElement(
              "button",
              { onClick: this.copyText.bind(this, debugTxt), disabled: busy },
              "Copy"
            )
          ),
          React.createElement(
            "pre",
            null,
            debugTxt
          )
        ),
        React.createElement(
          "section",
          null,
          React.createElement(
            "h2",
            null,
            "Simulate Fault"
          ),
          React.createElement(
            "ul",
            null,
            Object.keys(faultTypes).filter(function (key) {
              return faultTypes[key] > 0;
            }).map(function (key) {
              return React.createElement(
                "li",
                { key: key },
                React.createElement(IconButton, {
                  display: "text",
                  icon: "./img/icon.bomb.svg",
                  scale: 0.9,
                  label: key,
                  disabled: busy,
                  onPress: _this4.simulateFault.bind(_this4, faultTypes[key]) })
              );
            })
          )
        )
      );
    }
  }]);

  return DebugView;
}(React.Component);

});

require.register("js/view/RecordingsView.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _mc$widgets = mc.widgets,
    Table = _mc$widgets.Table,
    IconButton = _mc$widgets.IconButton,
    Meter = _mc$widgets.Meter;

var RecordingsView = exports.RecordingsView = function (_React$Component) {
  _inherits(RecordingsView, _React$Component);

  function RecordingsView(props) {
    _classCallCheck(this, RecordingsView);

    var _this = _possibleConstructorReturn(this, (RecordingsView.__proto__ || Object.getPrototypeOf(RecordingsView)).call(this, props));

    _this.interval = null;

    _this.state = {
      recordings: [],
      progress: {},
      busy: false
    };
    return _this;
  }

  _createClass(RecordingsView, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.loadRecordings();
      this.loadProgress();
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      clearInterval(this.interval);
    }
  }, {
    key: "loadRecordings",
    value: function loadRecordings() {
      var _this2 = this;

      var _props = this.props,
          sensor = _props.sensor,
          onBusy = _props.onBusy;

      var recordings = [];

      var getRec = function getRec(idx) {
        onBusy(true);

        sensor.getRecordingInfo(idx).then(function (rec) {
          recordings.push(rec);

          _this2.setState({ recordings: recordings });

          if (rec.inProgress) {
            _this2.interval = setInterval(_this2.refresh.bind(_this2), 5000);
          }

          getRec(idx + 1);
        }).catch(function (err) {
          console.log(err.message);
          onBusy(false);
        });
      };

      getRec(0);
    }
  }, {
    key: "loadProgress",
    value: function loadProgress() {
      var _this3 = this;

      var db = this.props.db;


      db.list().then(function (recs) {
        var progress = {};

        recs.forEach(function (rec) {
          progress[rec.recordingId] = rec.pagesDownloaded / rec.numPages;
        });

        _this3.setState({ progress: progress });
      });
    }
  }, {
    key: "refresh",
    value: function refresh() {
      var _this4 = this;

      var sensor = this.props.sensor;
      var recordings = this.state.recordings;


      var idx = recordings.length - 1;

      sensor.getRecordingInfo(idx).then(function (rec) {
        recordings[idx] = rec;

        _this4.setState({ recordings: recordings });
      });
    }
  }, {
    key: "downloadRecording",
    value: function downloadRecording(idx) {
      var _this5 = this;

      var _props2 = this.props,
          sensor = _props2.sensor,
          onBusy = _props2.onBusy,
          db = _props2.db;
      var recordings = this.state.recordings;


      var recInfo = recordings[idx];
      var isoDate = new Date(recInfo.timestampStart * 1000).toISOString();
      var serial = sensor.serial;
      var recId = recInfo.recordingId;

      onBusy(true, "Downloading ...");

      this.setState({ busy: true });

      db.download(sensor, recInfo, function (_ref) {
        var pctComplete = _ref.pctComplete,
            estTimeLeft = _ref.estTimeLeft;
        var progress = _this5.state.progress;


        var msg = "Downloading (" + mc.format.duration(estTimeLeft * 1000) + ")";

        onBusy(true, msg);

        progress[recInfo.recordingId] = pctComplete;

        _this5.setState({ progress: progress });
      }).then(function () {
        _this5.exportCsv(recInfo);
      }).catch(function (error) {
        mc.ui.alert(error.message, { level: "warn" });
      }).finally(function () {
        onBusy(false);

        _this5.setState({ busy: false });
      });
    }
  }, {
    key: "exportCsv",
    value: function exportCsv(recInfo) {
      var _props3 = this.props,
          sensor = _props3.sensor,
          db = _props3.db;


      var iso = new Date(recInfo.timestampStart * 1000).toISOString();

      var features = ["motion", "afe4900", "ad5940", "environment", "annotation"];

      mc.ui.spin(1, "Exporting CSV files ...");

      return Promise.all(features.filter(function (feature) {
        return recInfo.sensorConfig[feature] || feature === "annotation";
      }).map(function (feature) {
        return db.readCsv(sensor.serial, recInfo.recordingId, feature).then(function (txt) {
          if (txt.length) {
            BiostampUtils.writeFile(sensor.serial + "-" + iso + "-" + feature + ".csv", txt, "text/csv");
          }
        });
      })).finally(function () {
        mc.ui.spin(0);
      });
    }
  }, {
    key: "deleteRecording",
    value: function deleteRecording(idx) {
      var _this6 = this;

      var _props4 = this.props,
          sensor = _props4.sensor,
          onBusy = _props4.onBusy;
      var _state = this.state,
          recordings = _state.recordings,
          busy = _state.busy;


      mc.ui.alert("Delete this recording from the sensor?", {
        level: "warn",
        mode: "confirm",
        onHide: function onHide(confirmed) {
          if (confirmed) {
            _this6.setState({ busy: true });

            onBusy(true, "Deleting recording ...");

            sensor.clearOldestRecording().then(function () {
              recordings.shift();

              _this6.setState({ busy: false });

              onBusy(false);
            });
          }
        }
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this7 = this;

      var _props5 = this.props,
          sensor = _props5.sensor,
          disabled = _props5.disabled;
      var _state2 = this.state,
          recordings = _state2.recordings,
          progress = _state2.progress,
          busy = _state2.busy;


      var cols = [{
        prop: "timestampStart",
        label: "Date/Time (ID)",
        width: "25%",
        content: function content(rec) {
          return mc.format.datetime(rec.timestampStart * 1000) + " (" + rec.recordingId + ")";
        }
      }, {
        prop: "durationSec",
        label: "Duration",
        width: "12.5%",
        content: function content(rec) {
          return React.createElement(
            "span",
            { "data-rec-in-progress": rec.inProgress },
            mc.format.interval(rec.durationSec * 1000) + " "
          );
        }
      }, {
        prop: "sensorConfig",
        label: "Configuration (Metadata)",
        width: "25%",
        content: function content(rec) {
          return React.createElement(
            "pre",
            null,
            JSON.stringify(rec.sensorConfig) + " (" + BiostampUtils.decodeText(rec.metadata) + ")"
          );
        }
      }, {
        prop: "numPages",
        label: "Pages",
        width: "10%",
        content: function content(rec) {
          return mc.format.number(rec.numPages);
        }
      }, {
        prop: "pct",
        label: "% Downloaded",
        width: "15%",
        content: function content(rec, i, n) {
          var percent = progress[rec.recordingId] || 0;

          return React.createElement(Meter, {
            percent: percent,
            color: mc.ui.colors.GREEN,
            width: 90,
            height: 6,
            rounded: true,
            animate: true });
        }
      }, {
        prop: "pct",
        label: "Download",
        width: "7.5%",
        content: function content(rec, i, n) {
          return React.createElement(IconButton, {
            icon: "./img/icon.download.svg",
            label: "Download",
            disabled: rec.inProgress || disabled || busy,
            onPress: _this7.downloadRecording.bind(_this7, i) });
        }
      }, {
        prop: "del",
        label: "Delete",
        width: "5%",
        content: function content(rec, i, n) {
          return React.createElement(mc.widgets.IconButton, {
            icon: "./img/icon.delete.svg",
            label: "Delete",
            disabled: rec.inProgress || disabled || busy || i > 0,
            onPress: _this7.deleteRecording.bind(_this7, i) });
        }
      }];

      return React.createElement(
        "div",
        { className: "eng-rec-view" },
        React.createElement(
          "h1",
          null,
          sensor.serial
        ),
        React.createElement(Table, { data: recordings, cols: cols })
      );
    }
  }]);

  return RecordingsView;
}(React.Component);

});

require.register("js/view/SensorView.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SensorView = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _SensorConfig = require("js/util/SensorConfig");

var _RecordingsView = require("js/view/RecordingsView");

var _DatabaseView = require("js/view/DatabaseView");

var _DebugView = require("js/view/DebugView");

var _Stopwatch = require("js/widget/Stopwatch");

var _SensorStatus = require("js/widget/SensorStatus");

var _SensorPanel = require("js/widget/SensorPanel");

var _Projection = require("js/widget/Projection");

var _AFE4900PPG = require("js/widget/AFE4900PPG");

var _AFE4900SpO = require("js/widget/AFE4900SpO2");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _mc$widgets = mc.widgets,
    Toggle = _mc$widgets.Toggle,
    IconButton = _mc$widgets.IconButton,
    Drop = _mc$widgets.Drop;
var _BiostampSensor = BiostampSensor,
    AFE4900Mode = _BiostampSensor.AFE4900Mode;


var config = new _SensorConfig.SensorConfig();
var emitter = new mc.Emitter();
var db = void 0;

if (!navigator.bluetooth) {
  mc.ui.blast("This application requires the Web Bluetooth API. Try Google Chrome or Microsoft Edge.", { level: "warn" });
}

if (navigator.bluetooth) {
  try {
    db = new BiostampDb();
  } catch (e) {
    mc.ui.blast("Oh no! This app could not open a local database. Check your browser settings.", { level: "warn" });
  }
}

var SensorView = exports.SensorView = function (_React$Component) {
  _inherits(SensorView, _React$Component);

  function SensorView(props) {
    _classCallCheck(this, SensorView);

    var _this = _possibleConstructorReturn(this, (SensorView.__proto__ || Object.getPrototypeOf(SensorView)).call(this, props));

    _this.state = _extends({}, _this.getInitialState(), { config: config });

    _this.catchError = _this.catchError.bind(_this);
    return _this;
  }

  _createClass(SensorView, [{
    key: "getInitialState",
    value: function getInitialState() {
      return {
        sensor: null,
        version: null,
        freeSpace: null,
        recCount: null,
        status: {},
        busy: false,
        sensing: false,
        recStartTs: null,
        projecting: false,
        annotation: "Testing 1-2-3"
      };
    }
  }, {
    key: "invokeScan",
    value: function invokeScan() {
      var _this2 = this;

      var onDisconnect = this.onDisconnect.bind(this);

      BiostampSensor.connect("BRC3", onDisconnect).then(function (sensor) {
        window.sensor = sensor;

        _this2.setState({ sensor: sensor });
        _this2.refreshStatus();
      }).catch(function (error) {
        console.info(error.message);
      });
    }
  }, {
    key: "onDisconnect",
    value: function onDisconnect() {
      delete window.sensor;

      this.setState(this.getInitialState());
      this.setBusy(false);

      mc.ui.modal(null);

      console.log("disconnected!");
    }
  }, {
    key: "refreshStatus",
    value: function refreshStatus() {
      var _this3 = this;

      var sensor = this.state.sensor;


      this.setBusy(true);

      return sensor.getSystemStatus().then(function (status) {
        _this3.setState({ status: status });

        return sensor.getRecordingFreeSpace();
      }).then(function (freeSpace) {
        _this3.setState({ freeSpace: freeSpace });

        return sensor.getVersion();
      }).then(function (version) {
        _this3.setState({ version: version });

        return sensor.countRecordings();
      }).then(function (recCount) {
        _this3.setState({ recCount: recCount });

        return sensor.getSensingInfo();
      }).then(function (sensingInfo) {
        if (sensingInfo) {
          _this3.restoreSensing(sensingInfo);
        }

        _this3.setBusy(false);
      });
    }
  }, {
    key: "restoreSensing",
    value: function restoreSensing(sensingInfo) {
      this.setState({
        config: config.restore(sensingInfo.sensorConfig),
        sensing: true,
        recStartTs: sensingInfo.timestampStart * 1000
      });

      this.startStreaming();
    }
  }, {
    key: "enableRecording",
    value: function enableRecording(enabled) {
      var config = this.state.config;


      this.setState({
        config: config.setRecordingEnabled(enabled)
      });
    }
  }, {
    key: "toggleSensing",
    value: function toggleSensing() {
      var _this4 = this;

      var _state = this.state,
          sensing = _state.sensing,
          config = _state.config;


      if (sensing) {
        this.stopSensing();
      } else {
        if (config.recordingEnabled) {
          this.promptForMetadata().then(function (metadata) {
            _this4.startSensing(BiostampUtils.encodeText(metadata));
          });
        } else {
          this.startSensing();
        }
      }
    }
  }, {
    key: "copyConfig",
    value: function copyConfig() {
      var config = this.state.config;


      mc.ui.spin(1, "Copied");

      var txt = JSON.stringify(config.encode(), null, 2);

      navigator.clipboard.writeText(txt).then(function () {
        mc.ui.spin(0);
      });
    }
  }, {
    key: "promptForMetadata",
    value: function promptForMetadata() {
      return new Promise(function (resolve, reject) {
        var count = mc.cache.getItem("count_recs") || 0;

        var opts = {
          mode: "confirm",
          labels: {
            confirm: "Start",
            cancel: "Cancel"
          },
          input: "Test Recording " + (count + 1),
          inputLimit: 128,
          onHide: function onHide(confirmed, input) {
            if (confirmed) {
              resolve(input);

              mc.cache.setItem("count_recs", count + 1);
            }
          }
        };

        mc.ui.alert("Recording metadata:", opts);
      });
    }
  }, {
    key: "catchError",
    value: function catchError(error) {
      console.warn(error);

      this.setBusy(false);

      mc.ui.alert(error.message, { level: "error" });
    }
  }, {
    key: "openRecordingsView",
    value: function openRecordingsView() {
      var _state2 = this.state,
          sensor = _state2.sensor,
          sensing = _state2.sensing,
          config = _state2.config;


      var disabled = sensing && config.recordingEnabled;

      var onBusy = this.setBusy.bind(this);

      var view = React.createElement(_RecordingsView.RecordingsView, { sensor: sensor, disabled: disabled, onBusy: onBusy, db: db });

      mc.ui.modal(view, { minWidth: "90%" });
    }
  }, {
    key: "openDatabaseView",
    value: function openDatabaseView() {
      var view = React.createElement(_DatabaseView.DatabaseView, { db: db });

      mc.ui.modal(view, { minWidth: "80%" });
    }
  }, {
    key: "openDebugView",
    value: function openDebugView() {
      var sensor = this.state.sensor;


      var onBusy = this.setBusy.bind(this);

      var view = React.createElement(_DebugView.DebugView, { sensor: sensor, onBusy: onBusy });

      mc.ui.modal(view, { width: "450px" });
    }
  }, {
    key: "pickFile",
    value: function pickFile() {
      var input = document.querySelector("input[type=file]");

      input.click();
    }
  }, {
    key: "setFile",
    value: function setFile(evt) {
      var _this5 = this;

      var sensor = this.state.sensor;

      var input = evt.target;
      var file = input.files[0];
      var reader = new FileReader();

      if (file) {
        reader.onloadend = function () {
          var image = new Uint8Array(reader.result);

          _this5.setBusy(true, "Uploading firmware ...");

          sensor.uploadFirmwareImage(Array.from(image)).then(function () {
            _this5.setBusy(false);

            input.value = null;
          }).then(function () {
            console.log("Loading firmware ...");

            return sensor.loadFirmwareImage();
          }).then(function () {
            console.log("Loaded firmware");
          }).catch(_this5.catchError);
        };

        reader.readAsArrayBuffer(file);
      }
    }
  }, {
    key: "setBusy",
    value: function setBusy(busy) {
      var msg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "Busy ...";

      this.setState({ busy: busy });

      mc.ui.spin(busy ? 1 : 0, msg);
    }
  }, {
    key: "blinkLeds",
    value: function blinkLeds() {
      var _this6 = this;

      var sensor = this.state.sensor;


      this.setBusy(true);

      return sensor.blinkLeds().then(function (resp) {
        _this6.setBusy(false);
      }).catch(this.catchError);
    }
  }, {
    key: "clearAllRecordings",
    value: function clearAllRecordings() {
      var _this7 = this;

      var sensor = this.state.sensor;


      this.setBusy(true);

      return sensor.clearAllRecordings().then(function () {
        _this7.setBusy(false);
        _this7.refreshStatus();
      }).catch(this.catchError);
    }
  }, {
    key: "powerOff",
    value: function powerOff() {
      var _this8 = this;

      var sensor = this.state.sensor;


      this.setBusy(true);

      return sensor.powerOff().then(function () {
        _this8.setBusy(false);
      }).catch(this.catchError);
    }
  }, {
    key: "setTime",
    value: function setTime() {
      var _this9 = this;

      var sensor = this.state.sensor;


      this.setBusy(true);

      return sensor.setTime(Date.now() / 1000).then(function () {
        _this9.setBusy(false);
      }).catch(this.catchError);
    }
  }, {
    key: "reset",
    value: function reset() {
      var _this10 = this;

      var sensor = this.state.sensor;


      this.setBusy(true);

      return sensor.reset().then(function () {
        _this10.setBusy(false);
      }).catch(this.catchError);
    }
  }, {
    key: "startSensing",
    value: function startSensing(metadataBytes) {
      var _this11 = this;

      var _state3 = this.state,
          sensor = _state3.sensor,
          config = _state3.config;


      this.setBusy(true);

      return sensor.setTime().then(function () {
        return sensor.startSensing(config.encode(), 0, metadataBytes).then(function () {
          _this11.setState({
            sensing: true,
            recStartTs: Date.now()
          });

          _this11.setBusy(false);
          _this11.startStreaming();
        });
      }).catch(this.catchError);
    }
  }, {
    key: "startStreaming",
    value: function startStreaming() {
      var _state4 = this.state,
          sensor = _state4.sensor,
          config = _state4.config;


      var commands = [];

      if (config.isEngaged("motion")) {
        commands.push(function () {
          return sensor.startStreaming(BiostampSensor.StreamingType.MOTION, function (packet) {
            emitter.emit("motion", packet);
          });
        });
      }

      if (config.isEngaged("afe4900")) {
        commands.push(function () {
          return sensor.startStreaming(BiostampSensor.StreamingType.AFE4900, function (packet, ts) {
            emitter.emit("afe4900", packet);
          });
        });
      }

      if (config.isEngaged("environment")) {
        commands.push(function () {
          return sensor.startStreaming(BiostampSensor.StreamingType.ENVIRONMENT, function (packet) {
            emitter.emit("environment", packet);
          });
        });
      }

      if (config.isEngaged("ad5940")) {
        commands.push(function () {
          return sensor.startStreaming(BiostampSensor.StreamingType.AD5940, function (packet) {
            emitter.emit("ad5940", packet);
          });
        });
      }

      return mc.utils.chain(commands);
    }
  }, {
    key: "stopSensing",
    value: function stopSensing() {
      var _this12 = this;

      var sensor = this.state.sensor;


      this.setBusy(true);

      return sensor.stopSensing().then(function () {
        _this12.setState({
          sensing: false,
          recStartTs: null
        });

        _this12.setBusy(false);
      }).catch(this.catchError);
    }
  }, {
    key: "alertTemp",
    value: function alertTemp() {
      var _this13 = this;

      var sensor = this.state.sensor;


      this.setBusy(true);

      return sensor.getTemperature().then(function (temp) {
        _this13.setBusy(false);

        mc.ui.alert(temp + " (" + mc.format.temperature(temp, "F") + ")");
      }).catch(this.catchError);
    }
  }, {
    key: "alertPressure",
    value: function alertPressure() {
      var _this14 = this;

      var sensor = this.state.sensor;


      this.setBusy(true);

      return sensor.getPressure().then(function (pressure) {
        _this14.setBusy(false);

        mc.ui.alert(pressure);
      }).catch(this.catchError);
    }
  }, {
    key: "alertTime",
    value: function alertTime() {
      var _this15 = this;

      var sensor = this.state.sensor;


      this.setBusy(true);

      return sensor.getTime().then(function (timestamp) {
        _this15.setBusy(false);

        mc.ui.alert(timestamp + " (" + new Date(timestamp * 1000) + ")");
      }).catch(this.catchError);
    }
  }, {
    key: "disconnect",
    value: function disconnect() {
      var sensor = this.state.sensor;


      sensor.disconnect();

      this.setState({
        sensor: null
      });
    }
  }, {
    key: "onToggleFeature",
    value: function onToggleFeature(featureId, engaged) {
      var config = this.state.config;


      this.setState({
        config: config.toggleFeature(featureId, engaged)
      });
    }
  }, {
    key: "onEditFeature",
    value: function onEditFeature(featureId, valueKey, valueActual) {
      var config = this.state.config;


      this.setState({
        config: config.editFeature(featureId, valueKey, valueActual)
      });
    }
  }, {
    key: "setAnnotation",
    value: function setAnnotation(evt) {
      this.setState({
        annotation: evt.target.value
      });
    }
  }, {
    key: "submitAnnotation",
    value: function submitAnnotation() {
      var _this16 = this;

      var _state5 = this.state,
          sensor = _state5.sensor,
          annotation = _state5.annotation;


      this.setBusy(true);

      sensor.annotate(annotation).then(function (timestamp) {
        _this16.setBusy(false);
      });
    }
  }, {
    key: "project",
    value: function project(projecting) {
      this.setState({ projecting: projecting });

      mc.ui.freeze(projecting);
    }
  }, {
    key: "isProjectable",
    value: function isProjectable(config) {
      var cfg = config.getFeature("motion");

      return cfg.engaged && cfg.value.mode === BiostampSensor.MotionMode.ROTATION;
    }
  }, {
    key: "render",
    value: function render() {
      var _this17 = this;

      var _state6 = this.state,
          sensor = _state6.sensor,
          busy = _state6.busy,
          sensing = _state6.sensing,
          recStartTs = _state6.recStartTs,
          status = _state6.status,
          freeSpace = _state6.freeSpace,
          recCount = _state6.recCount,
          version = _state6.version,
          config = _state6.config,
          projecting = _state6.projecting,
          annotation = _state6.annotation;


      var ops = [{ label: "Blink LED", fn: this.blinkLeds }, { label: "Set time", fn: this.setTime }, { label: "Get time", fn: this.alertTime }, { label: "Get temperature", fn: this.alertTemp }, { label: "Get pressure", fn: this.alertPressure }, { label: "List recordings", fn: this.openRecordingsView }, { label: "Clear all recordings", fn: this.clearAllRecordings }, { label: "Upload firmware", fn: this.pickFile }, { label: "Reset", fn: this.reset }, { label: "Power off", fn: this.powerOff }, { label: "Disconnect", fn: this.disconnect }];

      function sensorPanelForFeature(feature) {
        var drop = null;

        if (feature.id === "afe4900" && feature.engaged) {
          if (feature.value.mode !== AFE4900Mode.ECG) {
            var panel = feature.value.mode === AFE4900Mode.SPO2 ? _AFE4900SpO.AFE4900SpO2 : _AFE4900PPG.AFE4900PPG;

            drop = React.createElement(
              Drop,
              null,
              React.createElement(IconButton, { icon: "configure" }),
              React.createElement(
                "div",
                { className: "mc-drop-content" },
                React.createElement(panel, {
                  sensor: sensor,
                  emitter: emitter,
                  sensing: sensing,
                  busy: busy,
                  config: feature.value,
                  setBusy: this.setBusy.bind(this)
                })
              )
            );
          }
        }

        return React.createElement(
          _SensorPanel.SensorPanel,
          {
            key: feature.id,
            emitter: emitter,
            feature: feature,
            disabled: sensing,
            onToggleFeature: this.onToggleFeature.bind(this),
            onEditFeature: this.onEditFeature.bind(this) },
          drop
        );
      }

      return React.createElement(
        "div",
        null,
        React.createElement(_Projection.Projection, { emitter: emitter, projecting: projecting, onClose: this.project.bind(this, false) }),
        React.createElement(
          "div",
          { id: "main", "aria-hidden": projecting },
          React.createElement(_Stopwatch.Stopwatch, { sensing: sensing, recStartTs: recStartTs }),
          React.createElement(
            "div",
            { className: "eng-header mc-split-layout" },
            React.createElement(
              "h1",
              null,
              sensor ? sensor.serial : "[No sensor]"
            ),
            React.createElement(
              "div",
              null,
              React.createElement(
                "div",
                { id: "annotation", "aria-hidden": !sensing || !config.isRecordingEnabled() },
                React.createElement("input", {
                  type: "text",
                  maxLength: 220,
                  value: annotation,
                  onChange: this.setAnnotation.bind(this) }),
                React.createElement(IconButton, {
                  icon: "./img/icon.annotate.svg",
                  scale: 1.1,
                  label: "Annotate",
                  disabled: annotation.length === 0,
                  onPress: this.submitAnnotation.bind(this) })
              ),
              React.createElement(Toggle, {
                id: "eng-rec-toggle",
                pressed: config.isRecordingEnabled(),
                disabled: sensing,
                labels: ["Rec", "Rec"],
                background: mc.ui.colors.HOT_PINK,
                onPress: function onPress(pressed) {
                  return _this17.enableRecording(pressed);
                } }),
              React.createElement(IconButton, {
                icon: sensing ? "./img/icon.stop.svg" : "./img/icon.start.svg",
                scale: 1.6,
                disabled: !sensor || busy || !config.isValid(),
                onPress: this.toggleSensing.bind(this),
                label: sensing ? "Stop Sensing" : "Start Sensing" }),
              React.createElement(IconButton, {
                icon: "refresh",
                scale: 1.1,
                disabled: !sensor || busy,
                onPress: this.refreshStatus.bind(this),
                label: "Refresh" }),
              React.createElement(IconButton, {
                icon: "./img/icon.debug.svg",
                scale: 1.1,
                disabled: !sensor || busy,
                onPress: this.openDebugView.bind(this),
                label: "Debug" }),
              React.createElement(IconButton, {
                icon: "./img/icon.3d.svg",
                scale: 1.1,
                disabled: !sensor || !this.isProjectable(config) || !sensing,
                onPress: this.project.bind(this, true),
                label: "3D" }),
              React.createElement(IconButton, {
                icon: "./img/icon.db.svg",
                scale: 1.1,
                onPress: this.openDatabaseView.bind(this),
                disabled: !navigator.bluetooth,
                label: "DB" }),
              React.createElement(IconButton, {
                icon: "./img/icon.bluetooth.svg",
                scale: 1.1,
                disabled: !!sensor || !navigator.bluetooth,
                onPress: this.invokeScan.bind(this),
                label: "Scan" })
            )
          ),
          React.createElement(
            "div",
            { className: "mc-sidebar-layout" },
            React.createElement(
              "div",
              null,
              config.features.map(sensorPanelForFeature.bind(this)),
              React.createElement(
                "button",
                { onClick: this.copyConfig.bind(this) },
                React.createElement(
                  "small",
                  null,
                  "Copy config to clipboard"
                )
              )
            ),
            React.createElement(
              "div",
              { className: "mc-sticky" },
              React.createElement(_SensorStatus.SensorStatus, {
                status: status,
                freeSpace: freeSpace,
                recCount: recCount,
                version: version }),
              React.createElement(
                "ul",
                { className: "eng-sensor-ops" },
                ops.map(function (op, i) {
                  return React.createElement(
                    "li",
                    { key: i },
                    React.createElement(
                      "button",
                      { disabled: !sensor || busy, onClick: op.fn.bind(_this17) },
                      op.label
                    )
                  );
                })
              ),
              React.createElement("input", { type: "file", onChange: this.setFile.bind(this) })
            )
          )
        )
      );
    }
  }]);

  return SensorView;
}(React.Component);

});

require.register("js/widget/AFE4900PPG.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AFE4900PPG = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _PPGCalibrate = require("js/util/PPGCalibrate");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _mc$widgets = mc.widgets,
    IconButton = _mc$widgets.IconButton,
    Slider = _mc$widgets.Slider,
    Check = _mc$widgets.Check;
var _BiostampSensor = BiostampSensor,
    AFE4900OffdacScale = _BiostampSensor.AFE4900OffdacScale,
    AFE4900TIAGain = _BiostampSensor.AFE4900TIAGain;

var AFE4900PPG = exports.AFE4900PPG = function (_React$Component) {
  _inherits(AFE4900PPG, _React$Component);

  function AFE4900PPG(props) {
    _classCallCheck(this, AFE4900PPG);

    var _this = _possibleConstructorReturn(this, (AFE4900PPG.__proto__ || Object.getPrototypeOf(AFE4900PPG)).call(this, props));

    _this.state = {
      ledCurrent: 12,
      offdacCurrent: 0,
      offdacCurrentAmbient: 0,
      offdacScale: AFE4900OffdacScale.OFFDAC_SCALE_1X,
      tiaGain: AFE4900TIAGain.TIA_GAIN_50KOHM,
      photodiodeDisconnect: false
    };
    return _this;
  }

  _createClass(AFE4900PPG, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var emitter = this.props.emitter;


      emitter.on("afe4900", this.handlePacket, this);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      var emitter = this.props.emitter;


      emitter.off("afe4900", this.handlePacket);
    }
  }, {
    key: "handlePacket",
    value: function handlePacket(packet) {
      if (this.calibrator) {
        this.calibrator.handlePacket(packet);
      }
    }
  }, {
    key: "setLedCurrent",
    value: function setLedCurrent(ledCurrent) {
      this.setState({ ledCurrent: ledCurrent });
    }
  }, {
    key: "setOffdacCurrent",
    value: function setOffdacCurrent(offdacCurrent) {
      this.setState({ offdacCurrent: offdacCurrent });
    }
  }, {
    key: "setOffdacCurrentAmbient",
    value: function setOffdacCurrentAmbient(offdacCurrentAmbient) {
      this.setState({ offdacCurrentAmbient: offdacCurrentAmbient });
    }
  }, {
    key: "setOffdacScale",
    value: function setOffdacScale(evt) {
      var offdacScale = parseInt(evt.target.value);

      this.setState({ offdacScale: offdacScale });
    }
  }, {
    key: "setTiaGain",
    value: function setTiaGain(evt) {
      var tiaGain = parseInt(evt.target.value);

      this.setState({ tiaGain: tiaGain });
    }
  }, {
    key: "setTiaGainValue",
    value: function setTiaGainValue(tiaGain) {
      this.setState({ tiaGain: tiaGain });
    }
  }, {
    key: "setPhotodiodeDisconnect",
    value: function setPhotodiodeDisconnect(checked) {
      var photodiodeDisconnect = checked;

      this.setState({ photodiodeDisconnect: photodiodeDisconnect });
    }
  }, {
    key: "offdacScaleFactor",
    value: function offdacScaleFactor() {
      var offdacScale = this.state.offdacScale;

      var s = void 0;

      if (offdacScale === AFE4900OffdacScale.OFFDAC_SCALE_8X) {
        s = 8;
      } else if (offdacScale === AFE4900OffdacScale.OFFDAC_SCALE_4X) {
        s = 4;
      } else if (offdacScale === AFE4900OffdacScale.OFFDAC_SCALE_2X) {
        s = 2;
      } else {
        s = 1;
      }

      return s * 15.75;
    }
  }, {
    key: "applyConfig",
    value: function applyConfig(evt) {
      var _props = this.props,
          sensor = _props.sensor,
          setBusy = _props.setBusy;


      var config = this.state;

      setBusy(true);

      return sensor.afe4900DynamicConfig(config).then(function () {
        setBusy(false);
      });
    }
  }, {
    key: "calibrate",
    value: function calibrate() {
      if (this.calibrator) {
        return;
      }

      this.setState({ calibrating: true });
      this.calibrator = new _PPGCalibrate.PPGCalibrator(this, this.props.config);
      this.calibrator.start();
    }
  }, {
    key: "calibrateDone",
    value: function calibrateDone() {
      this.calibrator = undefined;
      this.setState({ calibrating: false });
    }
  }, {
    key: "cancelCalibrate",
    value: function cancelCalibrate() {
      if (!this.calibrator) {
        return;
      }

      this.calibrator.cancel();
      this.calibrateDone();
    }
  }, {
    key: "render",
    value: function render() {
      var _props2 = this.props,
          busy = _props2.busy,
          sensing = _props2.sensing;
      var _state = this.state,
          ledCurrent = _state.ledCurrent,
          offdacCurrent = _state.offdacCurrent,
          offdacCurrentAmbient = _state.offdacCurrentAmbient,
          offdacScale = _state.offdacScale,
          tiaGain = _state.tiaGain,
          photodiodeDisconnect = _state.photodiodeDisconnect,
          calibrating = _state.calibrating;


      return React.createElement(
        "div",
        { className: "eng-afe4900-ppg" },
        React.createElement(
          "ul",
          null,
          React.createElement(
            "li",
            null,
            React.createElement(
              "label",
              null,
              "TIA Gain R (F)"
            ),
            React.createElement(
              "select",
              { value: tiaGain, onChange: this.setTiaGain.bind(this) },
              React.createElement(
                "option",
                { value: AFE4900TIAGain.TIA_GAIN_10KOHM },
                "10kΩ"
              ),
              React.createElement(
                "option",
                { value: AFE4900TIAGain.TIA_GAIN_25KOHM },
                "25kΩ"
              ),
              React.createElement(
                "option",
                { value: AFE4900TIAGain.TIA_GAIN_50KOHM },
                "50kΩ"
              ),
              React.createElement(
                "option",
                { value: AFE4900TIAGain.TIA_GAIN_100KOHM },
                "100kΩ"
              ),
              React.createElement(
                "option",
                { value: AFE4900TIAGain.TIA_GAIN_250KOHM },
                "250kΩ"
              ),
              React.createElement(
                "option",
                { value: AFE4900TIAGain.TIA_GAIN_500KOHM },
                "500kΩ"
              ),
              React.createElement(
                "option",
                { value: AFE4900TIAGain.TIA_GAIN_1000KOHM },
                "1000kΩ"
              ),
              React.createElement(
                "option",
                { value: AFE4900TIAGain.TIA_GAIN_1500KOHM },
                "1500kΩ"
              ),
              React.createElement(
                "option",
                { value: AFE4900TIAGain.TIA_GAIN_2000KOHM },
                "2000kΩ"
              )
            )
          ),
          React.createElement(
            "li",
            null,
            React.createElement(
              "label",
              null,
              "Offset DAC scale"
            ),
            React.createElement(
              "select",
              { value: offdacScale, onChange: this.setOffdacScale.bind(this) },
              React.createElement(
                "option",
                { value: AFE4900OffdacScale.OFFDAC_SCALE_1X },
                "1x"
              ),
              React.createElement(
                "option",
                { value: AFE4900OffdacScale.OFFDAC_SCALE_2X },
                "2x"
              ),
              React.createElement(
                "option",
                { value: AFE4900OffdacScale.OFFDAC_SCALE_4X },
                "4x"
              ),
              React.createElement(
                "option",
                { value: AFE4900OffdacScale.OFFDAC_SCALE_8X },
                "8x"
              )
            )
          ),
          React.createElement(
            "li",
            null,
            React.createElement(
              "label",
              null,
              "LED I (OFFDAC)"
            ),
            React.createElement(Slider, {
              min: -127,
              max: 127,
              value: offdacCurrent,
              label: (offdacCurrent * this.offdacScaleFactor() / 127).toFixed(2) + "µA (" + offdacCurrent + ")",
              onChange: this.setOffdacCurrent.bind(this) })
          ),
          React.createElement(
            "li",
            null,
            React.createElement(
              "label",
              null,
              "Ambient I (OFFDAC)"
            ),
            React.createElement(Slider, {
              min: -127,
              max: 127,
              value: offdacCurrentAmbient,
              label: (offdacCurrentAmbient * this.offdacScaleFactor() / 127).toFixed(2) + "µA (" + offdacCurrentAmbient + ")",
              onChange: this.setOffdacCurrentAmbient.bind(this) })
          ),
          React.createElement(
            "li",
            null,
            React.createElement(
              "label",
              null,
              "I (LED)"
            ),
            React.createElement(Slider, {
              min: 0,
              max: 255,
              value: ledCurrent,
              label: (ledCurrent * 50 / 255).toFixed(1) + "mA (" + ledCurrent + ")",
              onChange: this.setLedCurrent.bind(this) })
          ),
          React.createElement(
            "li",
            null,
            React.createElement(Check, {
              label: "Photodiode Disconnect",
              checked: photodiodeDisconnect,
              size: "small",
              onCheck: this.setPhotodiodeDisconnect.bind(this) })
          )
        ),
        React.createElement(
          "button",
          { disabled: busy || calibrating, onClick: this.applyConfig.bind(this) },
          "Set"
        ),
        React.createElement(
          "button",
          { disabled: calibrating, onClick: this.calibrate.bind(this) },
          "Calibrate"
        ),
        React.createElement(
          "button",
          { disabled: !calibrating, onClick: this.cancelCalibrate.bind(this) },
          "Cancel Cal"
        )
      );
    }
  }]);

  return AFE4900PPG;
}(React.Component);

});

require.register("js/widget/AFE4900SpO2.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AFE4900SpO2 = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _PPGCalibrate = require("js/util/PPGCalibrate");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _mc$widgets = mc.widgets,
    IconButton = _mc$widgets.IconButton,
    Slider = _mc$widgets.Slider,
    Check = _mc$widgets.Check;
var _BiostampSensor = BiostampSensor,
    AFE4900OffdacScale = _BiostampSensor.AFE4900OffdacScale,
    AFE4900TIAGain = _BiostampSensor.AFE4900TIAGain;

var AFE4900SpO2 = exports.AFE4900SpO2 = function (_React$Component) {
  _inherits(AFE4900SpO2, _React$Component);

  function AFE4900SpO2(props) {
    _classCallCheck(this, AFE4900SpO2);

    var _this = _possibleConstructorReturn(this, (AFE4900SpO2.__proto__ || Object.getPrototypeOf(AFE4900SpO2)).call(this, props));

    _this.state = {
      ledCurrent: 12,
      ledCurrentIr: 12,
      offdacCurrent: 0,
      offdacCurrentIr: 0,
      offdacScale: AFE4900OffdacScale.OFFDAC_SCALE_1X,
      tiaGain: AFE4900TIAGain.TIA_GAIN_50KOHM,
      tiaGainIr: AFE4900TIAGain.TIA_GAIN_50KOHM,
      photodiodeDisconnect: false
    };
    return _this;
  }

  _createClass(AFE4900SpO2, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var emitter = this.props.emitter;


      emitter.on("afe4900", this.handlePacket, this);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      var emitter = this.props.emitter;


      emitter.off("afe4900", this.handlePacket);
    }
  }, {
    key: "handlePacket",
    value: function handlePacket(packet) {
      if (this.calibrator) {
        this.calibrator.handlePacket(packet);
      }
    }
  }, {
    key: "setLedCurrent",
    value: function setLedCurrent(ledCurrent) {
      this.setState({ ledCurrent: ledCurrent });
    }
  }, {
    key: "setLedCurrentIr",
    value: function setLedCurrentIr(ledCurrentIr) {
      this.setState({ ledCurrentIr: ledCurrentIr });
    }
  }, {
    key: "setOffdacCurrent",
    value: function setOffdacCurrent(offdacCurrent) {
      this.setState({ offdacCurrent: offdacCurrent });
    }
  }, {
    key: "setOffdacCurrentIr",
    value: function setOffdacCurrentIr(offdacCurrentIr) {
      this.setState({ offdacCurrentIr: offdacCurrentIr });
    }
  }, {
    key: "setOffdacScale",
    value: function setOffdacScale(evt) {
      var offdacScale = parseInt(evt.target.value);

      this.setState({ offdacScale: offdacScale });
    }
  }, {
    key: "setTiaGain",
    value: function setTiaGain(evt) {
      var tiaGain = parseInt(evt.target.value);

      this.setState({ tiaGain: tiaGain });
    }
  }, {
    key: "setTiaGainIr",
    value: function setTiaGainIr(evt) {
      var tiaGainIr = parseInt(evt.target.value);

      this.setState({ tiaGainIr: tiaGainIr });
    }
  }, {
    key: "setTiaGainValue",
    value: function setTiaGainValue(tiaGain) {
      this.setState({ tiaGain: tiaGain });
    }
  }, {
    key: "setTiaGainIrValue",
    value: function setTiaGainIrValue(tiaGainIr) {
      this.setState({ tiaGainIr: tiaGainIr });
    }
  }, {
    key: "setPhotodiodeDisconnect",
    value: function setPhotodiodeDisconnect(checked) {
      var photodiodeDisconnect = checked;

      this.setState({ photodiodeDisconnect: photodiodeDisconnect });
    }
  }, {
    key: "offdacScaleFactor",
    value: function offdacScaleFactor() {
      var offdacScale = this.state.offdacScale;

      var s = void 0;

      if (offdacScale === AFE4900OffdacScale.OFFDAC_SCALE_8X) {
        s = 8;
      } else if (offdacScale === AFE4900OffdacScale.OFFDAC_SCALE_4X) {
        s = 4;
      } else if (offdacScale === AFE4900OffdacScale.OFFDAC_SCALE_2X) {
        s = 2;
      } else {
        s = 1;
      }

      return s * 15.75;
    }
  }, {
    key: "applyConfig",
    value: function applyConfig(evt) {
      var _props = this.props,
          sensor = _props.sensor,
          setBusy = _props.setBusy;


      var config = this.state;

      setBusy(true);

      return sensor.afe4900DynamicConfig(config).then(function () {
        setBusy(false);
      });
    }
  }, {
    key: "calibrate",
    value: function calibrate() {
      if (this.calibrator) {
        return;
      }

      this.setState({ calibrating: true });
      this.calibrator = new _PPGCalibrate.SpO2Calibrator(this, this.props.config);
      this.calibrator.start();
    }
  }, {
    key: "calibrateDone",
    value: function calibrateDone() {
      this.calibrator = undefined;
      this.setState({ calibrating: false });
    }
  }, {
    key: "cancelCalibrate",
    value: function cancelCalibrate() {
      if (!this.calibrator) {
        return;
      }

      this.calibrator.cancel();
      this.calibrateDone();
    }
  }, {
    key: "render",
    value: function render() {
      var _props2 = this.props,
          busy = _props2.busy,
          sensing = _props2.sensing;
      var _state = this.state,
          ledCurrent = _state.ledCurrent,
          ledCurrentIr = _state.ledCurrentIr,
          offdacCurrent = _state.offdacCurrent,
          offdacCurrentIr = _state.offdacCurrentIr,
          offdacScale = _state.offdacScale,
          tiaGain = _state.tiaGain,
          tiaGainIr = _state.tiaGainIr,
          photodiodeDisconnect = _state.photodiodeDisconnect,
          calibrating = _state.calibrating;


      return React.createElement(
        "div",
        { className: "eng-afe4900-ppg" },
        React.createElement(
          "ul",
          null,
          React.createElement(
            "li",
            null,
            React.createElement(
              "label",
              null,
              "TIA Gain R",
              React.createElement(
                "sub",
                null,
                "F"
              ),
              " Red"
            ),
            React.createElement(
              "select",
              { value: tiaGain, onChange: this.setTiaGain.bind(this) },
              React.createElement(
                "option",
                { value: AFE4900TIAGain.TIA_GAIN_10KOHM },
                "10kΩ"
              ),
              React.createElement(
                "option",
                { value: AFE4900TIAGain.TIA_GAIN_25KOHM },
                "25kΩ"
              ),
              React.createElement(
                "option",
                { value: AFE4900TIAGain.TIA_GAIN_50KOHM },
                "50kΩ"
              ),
              React.createElement(
                "option",
                { value: AFE4900TIAGain.TIA_GAIN_100KOHM },
                "100kΩ"
              ),
              React.createElement(
                "option",
                { value: AFE4900TIAGain.TIA_GAIN_250KOHM },
                "250kΩ"
              ),
              React.createElement(
                "option",
                { value: AFE4900TIAGain.TIA_GAIN_500KOHM },
                "500kΩ"
              ),
              React.createElement(
                "option",
                { value: AFE4900TIAGain.TIA_GAIN_1000KOHM },
                "1000kΩ"
              ),
              React.createElement(
                "option",
                { value: AFE4900TIAGain.TIA_GAIN_1500KOHM },
                "1500kΩ"
              ),
              React.createElement(
                "option",
                { value: AFE4900TIAGain.TIA_GAIN_2000KOHM },
                "2000kΩ"
              )
            )
          ),
          React.createElement(
            "li",
            null,
            React.createElement(
              "label",
              null,
              "TIA Gain R",
              React.createElement(
                "sub",
                null,
                "F"
              ),
              " Infrared"
            ),
            React.createElement(
              "select",
              { value: tiaGainIr, onChange: this.setTiaGainIr.bind(this) },
              React.createElement(
                "option",
                { value: AFE4900TIAGain.TIA_GAIN_10KOHM },
                "10kΩ"
              ),
              React.createElement(
                "option",
                { value: AFE4900TIAGain.TIA_GAIN_25KOHM },
                "25kΩ"
              ),
              React.createElement(
                "option",
                { value: AFE4900TIAGain.TIA_GAIN_50KOHM },
                "50kΩ"
              ),
              React.createElement(
                "option",
                { value: AFE4900TIAGain.TIA_GAIN_100KOHM },
                "100kΩ"
              ),
              React.createElement(
                "option",
                { value: AFE4900TIAGain.TIA_GAIN_250KOHM },
                "250kΩ"
              ),
              React.createElement(
                "option",
                { value: AFE4900TIAGain.TIA_GAIN_500KOHM },
                "500kΩ"
              ),
              React.createElement(
                "option",
                { value: AFE4900TIAGain.TIA_GAIN_1000KOHM },
                "1000kΩ"
              ),
              React.createElement(
                "option",
                { value: AFE4900TIAGain.TIA_GAIN_1500KOHM },
                "1500kΩ"
              ),
              React.createElement(
                "option",
                { value: AFE4900TIAGain.TIA_GAIN_2000KOHM },
                "2000kΩ"
              )
            )
          ),
          React.createElement(
            "li",
            null,
            React.createElement(
              "label",
              null,
              "Offset DAC scale"
            ),
            React.createElement(
              "select",
              { value: offdacScale, onChange: this.setOffdacScale.bind(this) },
              React.createElement(
                "option",
                { value: AFE4900OffdacScale.OFFDAC_SCALE_1X },
                "1x"
              ),
              React.createElement(
                "option",
                { value: AFE4900OffdacScale.OFFDAC_SCALE_2X },
                "2x"
              ),
              React.createElement(
                "option",
                { value: AFE4900OffdacScale.OFFDAC_SCALE_4X },
                "4x"
              ),
              React.createElement(
                "option",
                { value: AFE4900OffdacScale.OFFDAC_SCALE_8X },
                "8x"
              )
            )
          ),
          React.createElement(
            "li",
            null,
            React.createElement(
              "label",
              null,
              "I",
              React.createElement(
                "sub",
                null,
                "OFFDAC"
              ),
              " Red"
            ),
            React.createElement(Slider, {
              min: -127,
              max: 127,
              value: offdacCurrent,
              label: (offdacCurrent * this.offdacScaleFactor() / 127).toFixed(2) + "µA (" + offdacCurrent + ")",
              onChange: this.setOffdacCurrent.bind(this) })
          ),
          React.createElement(
            "li",
            null,
            React.createElement(
              "label",
              null,
              "I",
              React.createElement(
                "sub",
                null,
                "OFFDAC"
              ),
              " Infrared"
            ),
            React.createElement(Slider, {
              min: -127,
              max: 127,
              value: offdacCurrentIr,
              label: (offdacCurrentIr * this.offdacScaleFactor() / 127).toFixed(2) + "µA (" + offdacCurrentIr + ")",
              onChange: this.setOffdacCurrentIr.bind(this) })
          ),
          React.createElement(
            "li",
            null,
            React.createElement(
              "label",
              null,
              "I",
              React.createElement(
                "sub",
                null,
                "LED"
              ),
              " Red"
            ),
            React.createElement(Slider, {
              min: 0,
              max: 255,
              value: ledCurrent,
              label: (ledCurrent * 50 / 255).toFixed(1) + "mA (" + ledCurrent + ")",
              onChange: this.setLedCurrent.bind(this) })
          ),
          React.createElement(
            "li",
            null,
            React.createElement(
              "label",
              null,
              "I",
              React.createElement(
                "sub",
                null,
                "LED"
              ),
              " Infrared"
            ),
            React.createElement(Slider, {
              min: 0,
              max: 255,
              value: ledCurrentIr,
              label: (ledCurrentIr * 50 / 255).toFixed(1) + "mA (" + ledCurrentIr + ")",
              onChange: this.setLedCurrentIr.bind(this) })
          ),
          React.createElement(
            "li",
            null,
            React.createElement(Check, {
              label: "Photodiode Disconnect",
              checked: photodiodeDisconnect,
              size: "small",
              onCheck: this.setPhotodiodeDisconnect.bind(this) })
          )
        ),
        React.createElement(
          "button",
          { disabled: busy || calibrating, onClick: this.applyConfig.bind(this) },
          "Set"
        ),
        React.createElement(
          "button",
          { disabled: calibrating, onClick: this.calibrate.bind(this) },
          "Calibrate"
        ),
        React.createElement(
          "button",
          { disabled: !calibrating, onClick: this.cancelCalibrate.bind(this) },
          "Cancel Cal"
        )
      );
    }
  }]);

  return AFE4900SpO2;
}(React.Component);

});

require.register("js/widget/ECGStream.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ECGStream = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _SensorStream = require("js/widget/SensorStream");

var _ECGSignal = require("js/util/ECGSignal");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Check = mc.widgets.Check;
var _mc$ui$colors = mc.ui.colors,
    ORANGE = _mc$ui$colors.ORANGE,
    BLUE = _mc$ui$colors.BLUE;


var COLOR_ECG = ORANGE;
var COLOR_EMG = BLUE;
var AUTOSCALE_SEC = 3;
var DURATION_SEC = 10;

var ECGStream = exports.ECGStream = function (_React$Component) {
  _inherits(ECGStream, _React$Component);

  function ECGStream(props) {
    _classCallCheck(this, ECGStream);

    var _this = _possibleConstructorReturn(this, (ECGStream.__proto__ || Object.getPrototypeOf(ECGStream)).call(this, props));

    _this.initSignals();

    _this.state = {
      rateHz: _this.ecgSignal.rateHz,
      nSamples: _this.ecgSignal.nSamples,
      ecgSamples: [],
      ecgFilteredSamples: [],
      emgFilteredSamples: [],
      filtered: false
    };
    return _this;
  }

  _createClass(ECGStream, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var emitter = this.props.emitter;


      emitter.on("afe4900", this.setPacket, this);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      var _props = this.props,
          emitter = _props.emitter,
          feature = _props.feature;


      emitter.off("afe4900", this.setPacket);
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      if (prevProps.samplingPeriodUs !== this.props.samplingPeriodUs) {
        this.initSignals();
      }
    }
  }, {
    key: "initSignals",
    value: function initSignals() {
      var rateHz = 1000000 / this.props.samplingPeriodUs;
      this.ecgSignal = new _ECGSignal.ECGSignal(rateHz, DURATION_SEC);
      this.setState({
        nSamples: this.ecgSignal.nSamples
      });
    }
  }, {
    key: "secToSamples",
    value: function secToSamples(sec) {
      return Math.floor(sec * this.state.rateHz);
    }
  }, {
    key: "setPacket",
    value: function setPacket(packet) {
      var _this2 = this;

      if (packet[0].length) {
        this.ecgSignal.update(packet.map(function (p) {
          return p[_this2.props.ecgIndex];
        }));
      } else {
        this.ecgSignal.update(packet);
      }

      this.setState({
        ecgSamples: this.ecgSignal.samples,
        ecgFilteredSamples: this.ecgSignal.ecgFiltered,
        emgFilteredSamples: this.ecgSignal.emgFiltered
      });
    }
  }, {
    key: "setFiltered",
    value: function setFiltered(checked) {
      var filtered = checked;

      this.setState({ filtered: filtered });
    }
  }, {
    key: "renderRaw",
    value: function renderRaw() {
      return React.createElement(_SensorStream.SensorStream, {
        packets: this.state.ecgSamples,
        colors: [COLOR_ECG],
        numPoints: this.state.nSamples });
    }
  }, {
    key: "renderFiltered",
    value: function renderFiltered() {
      return React.createElement(
        "div",
        null,
        React.createElement(_SensorStream.SensorStream, {
          packets: this.state.ecgFilteredSamples,
          colors: [COLOR_ECG],
          autoscalePoints: this.secToSamples(AUTOSCALE_SEC),
          numPoints: this.state.nSamples }),
        React.createElement(_SensorStream.SensorStream, {
          packets: this.state.emgFilteredSamples,
          colors: [COLOR_EMG],
          numPoints: this.state.nSamples })
      );
    }
  }, {
    key: "render",
    value: function render() {
      var _state = this.state,
          smoothing = _state.smoothing,
          filtered = _state.filtered;


      var bullet = mc.charts.Legend.DOT;

      var items = void 0;

      if (filtered) {
        items = [{ label: "ECG", color: COLOR_ECG, bullet: bullet }, { label: "EMG", color: COLOR_EMG, bullet: bullet }];
      } else {
        items = [{ label: "Millivolts", color: COLOR_ECG, bullet: bullet }];
      }

      return React.createElement(
        "div",
        null,
        filtered ? this.renderFiltered.bind(this)() : this.renderRaw.bind(this)(),
        React.createElement(mc.charts.Legend, { items: items }),
        React.createElement(Check, {
          label: "ECG / EMG Filter",
          checked: smoothing,
          size: "xsmall",
          onCheck: this.setFiltered.bind(this) })
      );
    }
  }]);

  return ECGStream;
}(React.Component);

});

require.register("js/widget/PPGStream.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PPGStream = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _SensorStream = require("js/widget/SensorStream");

var _PPGSignal = require("js/util/PPGSignal");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Check = mc.widgets.Check;
var BLUE = mc.ui.colors.BLUE;


var COLOR_PPG = BLUE;
var AUTOSCALE_SEC = 2;
var DURATION_SEC = 10;
var WIN_SEC = 5;

var PPGStream = exports.PPGStream = function (_React$Component) {
  _inherits(PPGStream, _React$Component);

  function PPGStream(props) {
    _classCallCheck(this, PPGStream);

    var _this = _possibleConstructorReturn(this, (PPGStream.__proto__ || Object.getPrototypeOf(PPGStream)).call(this, props));

    _this.initSignals();

    _this.state = {
      rateHz: _this.ppgSignal.rateHz,
      ppgSamples: [],
      ppgSmoothedSamples: [],
      smoothing: true,
      ppgText: ""
    };
    return _this;
  }

  _createClass(PPGStream, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var emitter = this.props.emitter;


      emitter.on("afe4900", this.setPacket, this);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      var _props = this.props,
          emitter = _props.emitter,
          feature = _props.feature;


      emitter.off("afe4900", this.setPacket);
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      if (prevProps.samplingPeriodUs !== this.props.samplingPeriodUs) {
        this.initSignals();
      }
    }
  }, {
    key: "initSignals",
    value: function initSignals() {
      var rateHz = 1000000 / this.props.samplingPeriodUs;
      this.ppgSignal = new _PPGSignal.PPGSignal(rateHz, DURATION_SEC, WIN_SEC, "ppg");
      this.setState({ rateHz: rateHz });
    }
  }, {
    key: "secToSamples",
    value: function secToSamples(sec) {
      return Math.floor(sec * this.state.rateHz);
    }
  }, {
    key: "setPacket",
    value: function setPacket(packet) {
      var _this2 = this;

      this.ppgSignal.update(packet.map(function (p) {
        return p[_this2.props.ppgIndex];
      }));

      this.setState({
        ppgSamples: this.ppgSignal.samples,
        ppgSmoothedSamples: this.ppgSignal.smoothed,
        ppgText: this.ppgSignal.describe()
      });
    }
  }, {
    key: "setSmoothing",
    value: function setSmoothing(smoothing) {
      this.setState({ smoothing: smoothing });
    }
  }, {
    key: "render",
    value: function render() {
      var _state = this.state,
          smoothing = _state.smoothing,
          ppgSamples = _state.ppgSamples,
          ppgSmoothedSamples = _state.ppgSmoothedSamples,
          ppgText = _state.ppgText;


      var bullet = mc.charts.Legend.DOT;

      var items = [{ label: "PPG", color: COLOR_PPG, bullet: bullet }];

      return React.createElement(
        "div",
        null,
        React.createElement(_SensorStream.SensorStream, {
          packets: smoothing ? ppgSmoothedSamples : ppgSamples,
          colors: [COLOR_PPG],
          numPoints: this.secToSamples(DURATION_SEC),
          autoscalePoints: this.secToSamples(AUTOSCALE_SEC),
          plotText: ppgText }),
        React.createElement(mc.charts.Legend, { items: items }),
        React.createElement(Check, {
          label: "Smoothing",
          checked: smoothing,
          size: "xsmall",
          onCheck: this.setSmoothing.bind(this) })
      );
    }
  }]);

  return PPGStream;
}(React.Component);

});

require.register("js/widget/Projection.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Projection = exports.Projection = function (_React$Component) {
  _inherits(Projection, _React$Component);

  function Projection() {
    _classCallCheck(this, Projection);

    return _possibleConstructorReturn(this, (Projection.__proto__ || Object.getPrototypeOf(Projection)).apply(this, arguments));
  }

  _createClass(Projection, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _props = this.props,
          emitter = _props.emitter,
          onClose = _props.onClose;


      emitter.on("motion", this.setPacket, this);

      document.body.addEventListener("keyup", function (evt) {
        if (mc.ui.keyboard.isEscape(evt)) {
          onClose();
        }
      });
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      var emitter = this.props.emitter;


      emitter.off("motion", this.setPacket);
    }
  }, {
    key: "setPacket",
    value: function setPacket(packet) {
      var projecting = this.props.projecting;


      if (projecting) {
        var quat = new Quaternion(packet[0]).toMatrix4();

        var img = this.refs.img;

        requestAnimationFrame(function () {
          img.setAttribute("style", "transform: matrix3d(" + quat + ")");
        });
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _props2 = this.props,
          projecting = _props2.projecting,
          onClose = _props2.onClose;


      return React.createElement(
        "div",
        { id: "projection", onClick: onClose, "aria-hidden": !projecting },
        React.createElement("img", { src: "./img/sensor.svg", ref: "img" })
      );
    }
  }]);

  return Projection;
}(React.Component);

});

require.register("js/widget/SPO2Stream.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SPO2Stream = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _SensorStream = require("js/widget/SensorStream");

var _PPGSignal = require("js/util/PPGSignal");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Check = mc.widgets.Check;
var _mc$ui$colors = mc.ui.colors,
    GRAY = _mc$ui$colors.GRAY,
    RED = _mc$ui$colors.RED,
    TEAL = _mc$ui$colors.TEAL,
    GREEN = _mc$ui$colors.GREEN;


var COLOR_RED_CH = RED;
var COLOR_IR_CH = TEAL;
var AUTOSCALE_SEC = 2;
var DURATION_SEC = 10;
var WIN_SEC = 5;

var zip = function zip(cols) {
  var rows = new Array(cols[0].length);

  var _loop = function _loop(i) {
    rows[i] = cols.map(function (col) {
      return col[i];
    });
  };

  for (var i = 0; i < cols[0].length; i++) {
    _loop(i);
  }

  return rows;
};

var SPO2Stream = exports.SPO2Stream = function (_React$Component) {
  _inherits(SPO2Stream, _React$Component);

  function SPO2Stream(props) {
    _classCallCheck(this, SPO2Stream);

    var _this = _possibleConstructorReturn(this, (SPO2Stream.__proto__ || Object.getPrototypeOf(SPO2Stream)).call(this, props));

    _this.initSignals();

    _this.state = {
      rateHz: _this.redSignal.rateHz,
      redSamples: [],
      irSamples: [],
      redSmoothedSamples: [],
      irSmoothedSamples: [],
      smoothing: true,
      redText: "",
      irText: ""
    };
    return _this;
  }

  _createClass(SPO2Stream, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var emitter = this.props.emitter;


      emitter.on("afe4900", this.setPacket, this);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      var _props = this.props,
          emitter = _props.emitter,
          feature = _props.feature;


      emitter.off("afe4900", this.setPacket);
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      if (prevProps.samplingPeriodUs !== this.props.samplingPeriodUs) {
        this.initSignals();
      }
    }
  }, {
    key: "initSignals",
    value: function initSignals() {
      var rateHz = 1000000 / this.props.samplingPeriodUs;

      this.redSignal = new _PPGSignal.PPGSignal(rateHz, DURATION_SEC, WIN_SEC, "spo2");
      this.irSignal = new _PPGSignal.PPGSignal(rateHz, DURATION_SEC, WIN_SEC, "spo2");
      this.setState({ rateHz: rateHz });
    }
  }, {
    key: "secToSamples",
    value: function secToSamples(sec) {
      return Math.floor(sec * this.state.rateHz);
    }
  }, {
    key: "setPacket",
    value: function setPacket(packet) {
      this.redSignal.update(packet.map(function (p) {
        return p[0];
      }));
      this.irSignal.update(packet.map(function (p) {
        return p[1];
      }));

      var r = this.redSignal.rms / this.redSignal.dcLevel / (this.irSignal.rms / this.irSignal.dcLevel);

      this.setState({
        redSamples: this.redSignal.samples,
        irSamples: this.irSignal.samples,
        redSmoothedSamples: this.redSignal.smoothed,
        irSmoothedSamples: this.irSignal.smoothed,
        redText: this.redSignal.describe() + "       R=" + r.toFixed(3),
        irText: this.irSignal.describe()
      });
    }
  }, {
    key: "setSmoothing",
    value: function setSmoothing(smoothing) {
      this.setState({ smoothing: smoothing });
    }
  }, {
    key: "render",
    value: function render() {
      var _state = this.state,
          smoothing = _state.smoothing,
          redSamples = _state.redSamples,
          redSmoothedSamples = _state.redSmoothedSamples,
          redText = _state.redText,
          irSamples = _state.irSamples,
          irSmoothedSamples = _state.irSmoothedSamples,
          irText = _state.irText;


      var bullet = mc.charts.Legend.DOT;

      var items = [{ label: "Red", color: COLOR_RED_CH, bullet: bullet }, { label: "Infrared", color: COLOR_IR_CH, bullet: bullet }];

      // First plot is red channel autoscaled to show AC signal
      // Second plot is infrared channel autoscaled to show AC signal
      // Third plot is both red and infrared, with fixed scale to show DC level
      // Full scale of the ADC is 22 bits corresponding to +/-1.2v
      // Even though PPG signal can be made negative by using offset DAC, that
      // would not normally be done so we only show the positive range from 0 to
      // 1^21 codes.
      // Even though ADC full scale is 1.2v, for PPG the TIA output should not
      // exceed 1.0v, which is shown with a dashed line.

      return React.createElement(
        "div",
        null,
        React.createElement(_SensorStream.SensorStream, {
          packets: smoothing ? redSmoothedSamples : redSamples,
          colors: [COLOR_RED_CH],
          numPoints: this.secToSamples(DURATION_SEC),
          autoscalePoints: this.secToSamples(AUTOSCALE_SEC),
          plotText: redText }),
        React.createElement(_SensorStream.SensorStream, {
          packets: smoothing ? irSmoothedSamples : irSamples,
          colors: [COLOR_IR_CH],
          numPoints: this.secToSamples(DURATION_SEC),
          autoscalePoints: this.secToSamples(AUTOSCALE_SEC),
          plotText: irText }),
        React.createElement(_SensorStream.SensorStream, {
          packets: zip([redSamples, irSamples]),
          colors: [COLOR_RED_CH, COLOR_IR_CH],
          numPoints: this.secToSamples(DURATION_SEC),
          fixedExtent: [0, 1 << 21],
          tight: true,
          horizLines: [{ y: (1 << 21) * 1.0 / 1.2, color: GRAY }] }),
        React.createElement(mc.charts.Legend, { items: items }),
        React.createElement(Check, {
          label: "Smoothing",
          checked: smoothing,
          size: "xsmall",
          onCheck: this.setSmoothing.bind(this) })
      );
    }
  }]);

  return SPO2Stream;
}(React.Component);

});

require.register("js/widget/SensorPanel.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SensorPanel = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _SensorStream = require("js/widget/SensorStream");

var _ECGStream = require("js/widget/ECGStream");

var _PPGStream = require("js/widget/PPGStream");

var _SPO2Stream = require("js/widget/SPO2Stream");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _BiostampSensor = BiostampSensor,
    AFE4900Mode = _BiostampSensor.AFE4900Mode;

var SensorPanel = exports.SensorPanel = function (_React$Component) {
  _inherits(SensorPanel, _React$Component);

  function SensorPanel(props) {
    _classCallCheck(this, SensorPanel);

    var _this = _possibleConstructorReturn(this, (SensorPanel.__proto__ || Object.getPrototypeOf(SensorPanel)).call(this, props));

    _this.state = {
      packets: []
    };
    return _this;
  }

  _createClass(SensorPanel, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _props = this.props,
          emitter = _props.emitter,
          feature = _props.feature;


      emitter.on(feature.id, this.setPacket, this);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      var _props2 = this.props,
          emitter = _props2.emitter,
          feature = _props2.feature;


      emitter.off(feature.id, this.setPacket);
    }
  }, {
    key: "setPacket",
    value: function setPacket(packet) {
      var packets = this.state.packets;


      this.setState({
        packets: packets.concat(packet).slice(-500)
      });
    }
  }, {
    key: "editFeature",
    value: function editFeature(id, key, evt) {
      var onEditFeature = this.props.onEditFeature;


      this.setState({ packets: [] });

      onEditFeature(id, key, evt.target.value);
    }
  }, {
    key: "toggleFeature",
    value: function toggleFeature(id, pressed) {
      var onToggleFeature = this.props.onToggleFeature;


      this.setState({ packets: [] });

      onToggleFeature(id, pressed);
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      var _props3 = this.props,
          feature = _props3.feature,
          disabled = _props3.disabled,
          emitter = _props3.emitter,
          children = _props3.children;
      var id = feature.id,
          value = feature.value;


      function renderFeature(feature) {
        var _this2 = this;

        var mode = value.mode,
            samplingPeriodUs = value.samplingPeriodUs;


        if (id === "afe4900") {
          if (mode === AFE4900Mode.SPO2) {
            return React.createElement(_SPO2Stream.SPO2Stream, { emitter: emitter, samplingPeriodUs: samplingPeriodUs });
          } else if (mode === AFE4900Mode.PPG) {
            return React.createElement(_PPGStream.PPGStream, { emitter: emitter, samplingPeriodUs: samplingPeriodUs, ppgIndex: 0 });
          } else if (mode === AFE4900Mode.ECG) {
            return React.createElement(_ECGStream.ECGStream, { emitter: emitter, samplingPeriodUs: samplingPeriodUs });
          } else if (mode === AFE4900Mode.PTT) {
            return React.createElement(
              "div",
              null,
              React.createElement(_ECGStream.ECGStream, { emitter: emitter, samplingPeriodUs: samplingPeriodUs, ecgIndex: 0 }),
              React.createElement(_PPGStream.PPGStream, { emitter: emitter, samplingPeriodUs: samplingPeriodUs, ppgIndex: 1 })
            );
          }
        }

        return feature.signals(value).map(function (group, i) {
          var packets = _this2.state.packets;

          var data = feature.parse ? packets.map(feature.parse(value, i)) : packets;
          var colors = group.map(function (g) {
            return g.color;
          });
          var bullet = mc.charts.Legend.DOT;
          var items = group.map(function (g) {
            return _extends({}, g, { bullet: bullet });
          });

          return React.createElement(
            "div",
            { key: i },
            React.createElement(_SensorStream.SensorStream, { packets: data, colors: colors }),
            React.createElement(mc.charts.Legend, { items: items })
          );
        });
      }

      return React.createElement(
        "div",
        { className: "eng-sensor-panel" },
        React.createElement(
          "div",
          { className: "mc-split-layout" },
          React.createElement(
            "h2",
            null,
            feature.name
          ),
          React.createElement(
            "div",
            null,
            feature.opts.map(function (opt) {
              var applies = !opt.use || opt.use(value);

              return React.createElement(
                "select",
                {
                  key: opt.key,
                  value: value[opt.key],
                  "data-applies": applies,
                  disabled: disabled || !feature.engaged || !applies,
                  onChange: _this3.editFeature.bind(_this3, feature.id, opt.key) },
                opt.values.map(function (val) {
                  return React.createElement(
                    "option",
                    { key: val, value: val },
                    opt.tx ? opt.tx(val) : val
                  );
                })
              );
            }),
            children,
            React.createElement(mc.widgets.Toggle, {
              pressed: feature.engaged,
              disabled: disabled,
              onPress: this.toggleFeature.bind(this, feature.id) })
          )
        ),
        feature.engaged ? renderFeature.bind(this)(feature) : null
      );
    }
  }]);

  return SensorPanel;
}(React.Component);

});

require.register("js/widget/SensorStatus.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SensorStatus = SensorStatus;
var Meter = mc.widgets.Meter;

function SensorStatus(props) {
  var status = props.status,
      freeSpace = props.freeSpace,
      recCount = props.recCount,
      version = props.version;
  var batteryPercent = status.batteryPercent,
      chargePower = status.chargePower,
      uptimeSec = status.uptimeSec;


  var percentFull = NaN;

  if (freeSpace) {
    percentFull = 1 - freeSpace.freeBlocks / freeSpace.totalBlocks;
  }

  return React.createElement(
    "dl",
    { className: "eng-sensor-status" },
    React.createElement(
      "dt",
      null,
      "Battery"
    ),
    React.createElement(
      "dd",
      null,
      React.createElement(Meter, { percent: batteryPercent / 100, width: "85", height: "6", animate: true }),
      batteryPercent ? mc.format.percent(batteryPercent / 100) + " (" + batteryPercent * 42 + "mV) " : "?",
      chargePower ? React.createElement("img", {
        src: "./img/icon.charging.svg",
        width: "10",
        height: "16",
        "data-tooltip": "Charging" }) : null
    ),
    React.createElement(
      "dt",
      null,
      "Memory Used"
    ),
    React.createElement(
      "dd",
      null,
      React.createElement(Meter, { percent: percentFull, width: "85", height: "6", animate: true }),
      !isNaN(percentFull) ? mc.format.percent(percentFull) : "?"
    ),
    React.createElement(
      "dt",
      null,
      "Saved Recordings"
    ),
    React.createElement(
      "dd",
      null,
      recCount === null ? "?" : recCount
    ),
    React.createElement(
      "dt",
      null,
      "Uptime"
    ),
    React.createElement(
      "dd",
      null,
      uptimeSec ? mc.format.duration(uptimeSec * 1000) : "?"
    ),
    React.createElement(
      "dt",
      null,
      "Firmware Version"
    ),
    React.createElement(
      "dd",
      null,
      version ? version.firmwareVersion : "?"
    ),
    React.createElement(
      "dt",
      null,
      "Bootloader Version"
    ),
    React.createElement(
      "dd",
      null,
      version ? version.bootloaderVersion : "?"
    )
  );
}

});

;require.register("js/widget/SensorStream.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SensorStream = exports.SensorStream = function (_React$Component) {
  _inherits(SensorStream, _React$Component);

  function SensorStream() {
    _classCallCheck(this, SensorStream);

    return _possibleConstructorReturn(this, (SensorStream.__proto__ || Object.getPrototypeOf(SensorStream)).apply(this, arguments));
  }

  _createClass(SensorStream, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.plot = this.plot.bind(this);
      this.plot();
    }
  }, {
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps, nextState) {
      if (nextProps.packets && !document.hidden) {
        requestAnimationFrame(this.plot);
      }

      return false;
    }
  }, {
    key: "extent",
    value: function extent(values) {
      // Get the extent of all displayed points
      var min = Math.min.apply(null, values);
      var max = Math.max.apply(null, values);
      if (this.props.autoscalePoints) {
        // Get the extent of only the more recent points on the right side
        var v = values.slice(-this.props.autoscalePoints);
        var recentMin = Math.min.apply(null, v);
        var recentMax = Math.max.apply(null, v);
        // If the extent of the entire display is close enough to the recent
        // extent, then leave it alone. But if it's significantly larger, then
        // scale closer to the recent extent.
        if (max - min > 4.0 * (recentMax - recentMin)) {
          var a = recentMax - recentMin;
          var m = (recentMax + recentMin) / 2;
          max = m + a;
          min = m - a;
        }
      }

      if (min === max) {
        max *= 2;
        min = 0;
      }

      return [min, max];
    }
  }, {
    key: "numPoints",
    value: function numPoints() {
      return this.props.numPoints || 500;
    }
  }, {
    key: "points",
    value: function points(values, min, max, width, height) {
      var n = this.numPoints();

      var p = void 0;
      var topSpace = void 0;
      if (this.props.tight) {
        p = 1;
        topSpace = 0;
      } else {
        p = 10;
        topSpace = 40;
      }
      var h = height - topSpace;
      var x = function x(d, i) {
        return width * (i / n);
      };
      var y = function y(d, i) {
        return topSpace + (h - p - (h - p * 2) * ((d - min) / (max - min)));
      };

      return values.map(function (d, i) {
        return [x(d, i), y(d, i)];
      });
    }
  }, {
    key: "plot",
    value: function plot() {
      var _this2 = this;

      var colors = this.props.colors;

      var packets = this.getPackets();

      var canvas = this.refs.canvas;

      if (!canvas) {
        return;
      }

      var ctx = canvas.getContext("2d");
      var width = canvas.getBoundingClientRect().width * 2;
      var height = 120 * 2;

      var _ref = this.props.fixedExtent || this.extent(packets.flat()),
          _ref2 = _slicedToArray(_ref, 2),
          min = _ref2[0],
          max = _ref2[1];

      canvas.width = width;
      canvas.height = height;

      colors.forEach(function (color, i) {
        var values = packets.map(function (s) {
          return s.length ? s[i] : s;
        });

        var points = _this2.points(values, min, max, width, height);

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.beginPath();

        points.forEach(function (point) {
          ctx.lineTo(point[0], point[1]);
        });

        ctx.stroke();
      });

      if (this.props.horizLines) {
        this.props.horizLines.forEach(function (horizLine) {
          var p = _this2.points([horizLine.y], min, max, width, height);
          var y = p[0][1];
          ctx.strokeStyle = horizLine.color;
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        });
      }

      if (packets.length) {
        ctx.font = "24px sans-serif";
        ctx.fillStyle = "#666";
        ctx.fillText(this.getPlotText(packets), 15, 30);
      }
    }
  }, {
    key: "getPackets",
    value: function getPackets() {
      var packets = this.props.packets;


      return packets;
    }
  }, {
    key: "getPlotText",
    value: function getPlotText(packets) {
      if (this.props.plotText) {
        return this.props.plotText;
      }
      var sample = packets[packets.length - 1];

      return [].concat(sample).join(", ");
    }
  }, {
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        { className: "eng-sensor-stream" },
        React.createElement("canvas", { ref: "canvas", width: "100%", height: "120" })
      );
    }
  }]);

  return SensorStream;
}(React.Component);

});

require.register("js/widget/Stopwatch.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Stopwatch = exports.Stopwatch = function (_React$Component) {
  _inherits(Stopwatch, _React$Component);

  function Stopwatch(props) {
    _classCallCheck(this, Stopwatch);

    var _this = _possibleConstructorReturn(this, (Stopwatch.__proto__ || Object.getPrototypeOf(Stopwatch)).call(this, props));

    _this.interval = setInterval(_this.forceUpdate.bind(_this), 1000);

    _this.state = {
      recStartTs: null
    };
    return _this;
  }

  _createClass(Stopwatch, [{
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      clearInterval(this.interval);
    }
  }, {
    key: "render",
    value: function render() {
      var sensing = this.props.sensing;
      var recStartTs = this.state.recStartTs;


      var millis = recStartTs ? Date.now() - recStartTs : 0;

      return React.createElement(
        "div",
        { className: "eng-stopwatch", "aria-hidden": !sensing },
        mc.format.interval(millis)
      );
    }
  }], [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(props, state) {
      if (props.sensing && state.recStartTs === null) {
        return {
          recStartTs: props.recStartTs || Date.now()
        };
      } else if (!props.sensing) {
        return {
          recStartTs: null
        };
      }

      return null;
    }
  }]);

  return Stopwatch;
}(React.Component);

});

require.alias("process/browser.js", "process");process = require('process');require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');


//# sourceMappingURL=app.js.map