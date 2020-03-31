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
require.register("hec-biostamp-core/js/chart/BarChart.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BarChart = function (_React$Component) {
  _inherits(BarChart, _React$Component);

  function BarChart() {
    _classCallCheck(this, BarChart);

    return _possibleConstructorReturn(this, (BarChart.__proto__ || Object.getPrototypeOf(BarChart)).apply(this, arguments));
  }

  _createClass(BarChart, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.updateChart(this.props);
    }
  }, {
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps, nextState) {
      this.updateChart(nextProps);

      return false;
    }
  }, {
    key: "getNodeData",
    value: function getNodeData(props) {
      var widthOf = function widthOf(val) {
        return Math.abs(val / (props.domain[1] - props.domain[0]) * props.width);
      };

      var axis = widthOf(-props.domain[0]);
      var x = axis - widthOf(props.data.reduce(function (a, b) {
        return a + (b < 0 ? b : 0);
      }, 0));

      return props.data.map(function (val, i) {
        var w = widthOf(val);

        x += w;

        return {
          x: x - w,
          width: w,
          value: val,
          tip: props.tip(val, i)
        };
      });
    }
  }, {
    key: "updateChart",
    value: function updateChart(props) {
      var data = this.getNodeData(props);

      var colors = props.colors,
          height = props.height,
          transition = props.transition;


      var selection = d3.select(ReactDOM.findDOMNode(this)).select("g").selectAll("rect");

      var rects = selection.data(data);

      rects.exit().remove();

      rects = rects.enter().append("rect").merge(rects);

      rects.attr("height", height).attr("fill", function (d, i) {
        return colors[i];
      }).attr("data-tooltip", function (d, i) {
        return d.tip;
      });

      rects.transition().duration(transition).attr("x", function (d, i) {
        return d.x || 0;
      }).attr("width", function (d, i) {
        return d.width || 0;
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _props = this.props,
          width = _props.width,
          height = _props.height,
          background = _props.background;


      return React.createElement(
        "svg",
        { className: "mc-chart", width: width, height: height, style: { background: background } },
        React.createElement("rect", { width: width, height: height, fill: "rgba(0,0,0,0.05)" }),
        React.createElement("g", null)
      );
    }
  }]);

  return BarChart;
}(React.Component);

BarChart.defaultProps = {
  colors: [], // required
  data: [], // required
  width: 200,
  height: 15,
  domain: [0, 1],
  background: "none",
  transition: 500,
  tip: function tip(val, idx) {
    return val;
  }
};

module.exports = BarChart;

});

require.register("hec-biostamp-core/js/chart/Legend.js", function(exports, require, module) {
"use strict";

var Legend = function Legend(props) {
  var items = props.items,
      _props$flow = props.flow,
      flow = _props$flow === undefined ? "across" : _props$flow,
      onCheck = props.onCheck;


  return React.createElement(
    "ul",
    { className: "mc-legend", "data-flow": flow },
    items.map(function (item, i) {
      var bullet = item.bullet || Legend.SQUARE;

      return React.createElement(
        "li",
        {
          key: i,
          role: onCheck ? "checkbox" : null,
          "aria-checked": onCheck ? item.checked : null,
          onClick: onCheck ? function () {
            return onCheck(item.value, !item.checked);
          } : null },
        bullet(item),
        React.createElement(
          "span",
          null,
          item.label
        )
      );
    })
  );
};

Legend.SQUARE = function (item) {
  return React.createElement(
    "svg",
    { width: "10", height: "10" },
    React.createElement("rect", { width: "10", height: "10", fill: item.color })
  );
};

Legend.CIRCLE = function (item) {
  return React.createElement(
    "svg",
    { width: "10", height: "10" },
    React.createElement("circle", { cx: "5", cy: "5", r: "5", fill: item.color })
  );
};

Legend.DOT = function (item) {
  return React.createElement(
    "svg",
    { width: "10", height: "10" },
    React.createElement("circle", { cx: "5", cy: "5", r: "3", fill: item.color })
  );
};

Legend.DIAMOND = function (item) {
  return React.createElement(
    "svg",
    { width: "10", height: "10" },
    React.createElement("path", { d: "M5,0 L10,5 L5,10 L0,5Z", fill: item.color })
  );
};

Legend.TRIANGLE = function (item) {
  return React.createElement(
    "svg",
    { width: "10", height: "10" },
    React.createElement("path", { d: "M0,10 L5,1 L10,10Z", fill: item.color })
  );
};

Legend.LINE = function (item) {
  return React.createElement(
    "svg",
    { width: "20", height: "10" },
    React.createElement("path", { d: "M0,5 L20,5Z", stroke: item.color, fill: "none", strokeWidth: "2" })
  );
};

Legend.DASHED_LINE = function (item) {
  return React.createElement(
    "svg",
    { width: "20", height: "10" },
    React.createElement("path", { d: "M0,5 L20,5Z", stroke: item.color, fill: "none", strokeWidth: "2", strokeDasharray: "4 3" })
  );
};

Legend.CURVE = function (item) {
  return React.createElement(
    "svg",
    { width: "20", height: "10" },
    React.createElement("path", { d: "M3,7 C5,2 9,2 11,5 C12,6 15,9 19,2", stroke: item.color, fill: "none", strokeWidth: "2" })
  );
};

Legend.SPLINE = function (item) {
  return React.createElement(
    "svg",
    { width: "20", height: "10" },
    React.createElement("path", { d: "M0,5 L20,5Z", stroke: item.color, fill: "none", strokeWidth: "2" }),
    React.createElement("circle", { cx: "10", cy: "5", r: "3", fill: item.color })
  );
};

module.exports = Legend;

});

require.register("hec-biostamp-core/js/chart/LineChart.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LineChart = function (_React$Component) {
  _inherits(LineChart, _React$Component);

  function LineChart() {
    _classCallCheck(this, LineChart);

    return _possibleConstructorReturn(this, (LineChart.__proto__ || Object.getPrototypeOf(LineChart)).apply(this, arguments));
  }

  _createClass(LineChart, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.updateChart(this.props);
    }
  }, {
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps, nextState) {
      this.updateChart(nextProps);
      return false;
    }
  }, {
    key: "updateChart",
    value: function updateChart(props) {
      var svg = d3.select(ReactDOM.findDOMNode(this));

      var x = d3.scaleLinear().domain([0, props.data.length - 1]).range([5, props.width - 5]);

      var y = d3.scaleLinear().domain(props.domain).range([props.height - 3, 3]);

      var interpolators = {
        line: d3.curveLinear,
        step: d3.curveStep,
        smooth: d3.curveMonotoneX
      };

      var interpolator = interpolators[props.shape];

      var line = d3.line().curve(interpolator).x(function (d, i) {
        return x(d.x);
      }).y(function (d, i) {
        return y(d.y);
      });

      var area = d3.area().curve(interpolator).x(function (d, i) {
        return x(d.x);
      }).y0(props.height).y1(function (d, i) {
        return y(d.y);
      });

      var lineData = props.data.map(function (y, i) {
        return { x: i, y: y };
      });

      var stroke = svg.selectAll(".line-stroke");

      stroke.attr("d", line(lineData));

      if (this.props.fill) {
        var fill = svg.selectAll(".line-fill");

        fill.attr("d", area(lineData));
      }

      var circles = svg.selectAll("circle").data([lineData[0], lineData[lineData.length - 1]]);

      circles = circles.enter().append("circle").merge(circles).attr("fill", props.color).attr("r", 3);

      circles.exit().remove();

      circles.attr("cx", function (d, i) {
        return x(d.x);
      }).attr("cy", function (d, i) {
        return y(d.y);
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _props = this.props,
          width = _props.width,
          height = _props.height,
          color = _props.color;


      return React.createElement(
        "svg",
        { className: "mc-chart", width: width, height: height },
        React.createElement("path", {
          className: "line-fill",
          fill: color,
          opacity: "0.2",
          style: { pointerEvents: "none" } }),
        React.createElement("path", {
          className: "line-stroke",
          fill: "none",
          stroke: color,
          strokeWidth: "2",
          strokeLinecap: "round" })
      );
    }
  }]);

  return LineChart;
}(React.Component);

LineChart.defaultProps = {
  color: "#666666", // required
  data: [], // required
  width: 100,
  height: 25,
  shape: "line", // line | smooth | step
  fill: false,
  domain: [0, 1]
};

module.exports = LineChart;

});

require.register("hec-biostamp-core/js/chart/PieChart.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PieChart = function (_React$Component) {
  _inherits(PieChart, _React$Component);

  function PieChart() {
    _classCallCheck(this, PieChart);

    return _possibleConstructorReturn(this, (PieChart.__proto__ || Object.getPrototypeOf(PieChart)).apply(this, arguments));
  }

  _createClass(PieChart, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.updateChart(this.props);
    }
  }, {
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps, nextState) {
      if (nextProps.data.toString() !== this.props.data.toString()) {
        this.updateChart(nextProps);
      }

      return false;
    }
  }, {
    key: "updateChart",
    value: function updateChart(props) {
      var data = props.data,
          size = props.size,
          hole = props.hole,
          colors = props.colors,
          tip = props.tip,
          transition = props.transition;


      var outerRadius = size / 2;
      var innerRadius = outerRadius - outerRadius * (1 - hole);

      var arc = d3.arc().outerRadius(outerRadius).innerRadius(innerRadius);

      var pie = d3.pie().sort(null);

      var arcTween = function arcTween(endDatum, i) {
        var _this2 = this;

        var interpolate = d3.interpolate(this._current || {}, endDatum);

        return function (t) {
          _this2._current = endDatum;
          return arc(interpolate(t));
        };
      };

      var node = ReactDOM.findDOMNode(this);

      var paths = d3.select(node).select("g").selectAll("path").data(pie(data));

      paths = paths.enter().append("path").each(function (d) {
        this._current = d;
      }).merge(paths);

      paths.attr("fill", function (d, i) {
        return colors[i];
      }).attr("data-tooltip", function (d, i) {
        return tip ? tip(d.value, i) : null;
      });

      if (transition) {
        paths.interrupt().transition().duration(transition).attrTween("d", arcTween);
      } else {
        paths.attr("d", arc);
      }

      paths.exit().remove();
    }
  }, {
    key: "render",
    value: function render() {
      var _props = this.props,
          size = _props.size,
          rotate = _props.rotate,
          hole = _props.hole;

      var radius = size / 2;
      var transform = "translate(" + radius + "," + radius + ") rotate(" + rotate + ")";
      var stroke = (size - size * hole) / 2;

      return React.createElement(
        "svg",
        { className: "mc-chart", width: size, height: size },
        React.createElement("circle", {
          cx: radius,
          cy: radius,
          r: radius - stroke / 2,
          fill: "none",
          stroke: "rgba(0,0,0,0.05)",
          strokeWidth: stroke }),
        React.createElement("g", { transform: transform })
      );
    }
  }]);

  return PieChart;
}(React.Component);

PieChart.defaultProps = {
  colors: [], // required
  data: [], // required
  size: 75,
  rotate: 0,
  transition: 500,
  hole: 0.0,
  tip: function tip(val, idx) {
    return val;
  }
};

module.exports = PieChart;

});

require.register("hec-biostamp-core/js/lib/Ajax.js", function(exports, require, module) {
"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var Emitter = require("./Emitter");

var baseUrl = "";

var globalHeaders = {};

var authFn = function authFn(url) {
  return Promise.resolve(null);
};

var request = function request(method, _url, data, headers) {
  var serializable = (typeof data === "undefined" ? "undefined" : _typeof(data)) === "object" && !(data instanceof FormData);
  var payload = serializable ? JSON.stringify(data) : data;

  var url = _url.match(/^(\.|http)/) ? _url : baseUrl + _url;

  return authFn(url).then(function (user) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.timeout = 0;

      if (serializable) {
        xhr.setRequestHeader("Content-Type", "application/json");
      }

      for (var h in globalHeaders) {
        xhr.setRequestHeader(h, globalHeaders[h]);
      }

      for (var _h in headers) {
        xhr.setRequestHeader(_h, headers[_h]);
      }

      if (user) {
        xhr.setRequestHeader("Authorization", "Basic " + btoa(user.id + ":" + user.token));
      }

      xhr.onerror = function () {
        reject(new AjaxError("Cannot load " + url, xhr));
        Ajax.emit("fatal", xhr.status, xhr.getAllResponseHeaders());
        Ajax.emit("after", xhr.status, xhr.getAllResponseHeaders());
      };

      xhr.ontimeout = function () {
        reject(new AjaxError("Timed out while loading " + url, xhr));
        Ajax.emit("after", xhr.status, xhr.getAllResponseHeaders());
        Ajax.emit("fatal", xhr.status, xhr.getAllResponseHeaders());
      };

      xhr.onload = function () {
        resolve(xhr.responseText);
        Ajax.emit("after", xhr.status, xhr.getAllResponseHeaders());
      };

      xhr.onreadystatechange = function () {
        var stat = void 0;
        var msg = void 0;

        if (xhr.readyState === 4) {
          stat = xhr.status;

          if (!stat || (stat < 200 || stat >= 300) && stat !== 304) {
            try {
              msg = JSON.parse(xhr.responseText).message;
            } catch (e) {
              msg = "Cannot load " + url + " (" + stat + ")";
            }

            reject(new AjaxError(msg, xhr));

            if (stat >= 400) {
              Ajax.emit("fatal", xhr.status, xhr.getAllResponseHeaders());
            }
          }
        }
      };

      Ajax.emit("before");
      xhr.send(payload);
    });
  });
};

var AjaxError = function AjaxError(message, xhr) {
  this.name = "AjaxError";
  this.message = message;
  this.status = xhr.status;
  this.response = xhr.response;
  this.stack = new Error().stack;
};

AjaxError.prototype = Object.create(Error.prototype);
AjaxError.prototype.constructor = AjaxError;

var Ajax = new Emitter({
  AjaxError: AjaxError,

  get: function get(url) {
    var headers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return request("GET", url, undefined, _extends({}, headers, { "If-Modified-Since": "0" }));
  },
  post: function post(url, data) {
    var headers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    return request("POST", url, data, headers);
  },
  put: function put(url, data) {
    var headers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    return request("PUT", url, data, headers);
  },
  del: function del(url) {
    var headers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return request("DELETE", url, {}, headers);
  },
  base: function base(_baseUrl) {
    baseUrl = _baseUrl;
  },
  auth: function auth(_authFn) {
    authFn = _authFn;
  },
  headers: function headers(_globalHeaders) {
    globalHeaders = _globalHeaders;
  },
  parse: function parse(response) {
    try {
      return JSON.parse(response);
    } catch (e) {
      Ajax.emit("fatal", 0);
    }
  },
  serialize: function serialize(data) {
    var q = [];

    for (var i in data) {
      q.push(i + "=" + encodeURIComponent(data[i]));
    }

    return q.join("&");
  },
  mock: function mock(status, response, latency) {
    setTimeout(function () {
      Ajax.emit("before");
    }, 50);

    return new Promise(function (resolve, reject) {
      var fn = void 0;
      var txt = JSON.stringify(response);

      if (status === 200) {
        fn = resolve.bind(null, txt);
      } else {
        fn = reject.bind(null, new AjaxError("Oops!", { status: status, response: txt }));
      }

      setTimeout(function () {
        fn();
        Ajax.emit("after", status, {});

        if (status >= 400) {
          Ajax.emit("fatal", status);
        }
      }, latency || 500);
    });
  }
});

module.exports = Ajax;

});

require.register("hec-biostamp-core/js/lib/Auth.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Auth = function () {
  function Auth() {
    _classCallCheck(this, Auth);
  }

  _createClass(Auth, [{
    key: "getCredentials",
    value: function getCredentials(url, user) {
      // 10 second buffer
      var now = Date.now() + 10000;

      if (user && user.expiration > now) {
        if (url.match(/mc10cloud.com|localhost|127.0.0.1/) && url.indexOf("cdn.mc10cloud") === -1) {
          return Promise.resolve({
            id: user.user.id,
            token: user.accessToken
          });
        }
      }

      return Promise.resolve(null);
    }
  }]);

  return Auth;
}();

module.exports = Auth;

});

require.register("hec-biostamp-core/js/lib/Bundle.js", function(exports, require, module) {
"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Bundle = function () {
  function Bundle(language) {
    _classCallCheck(this, Bundle);

    this.language = "en";
    this._messages = {};

    this.setLanguage(language);
  }

  _createClass(Bundle, [{
    key: "setLanguage",
    value: function setLanguage(language) {
      if (language in Bundle.plurals) {
        this.language = language;
      }
    }
  }, {
    key: "addMessages",
    value: function addMessages(messages) {
      this._messages = _extends({}, this._messages, messages);
    }
  }, {
    key: "translate",
    value: function translate(key, tokens) {
      var message = this._messages[key];
      var warning = "Message '" + key + "' not found in bundle, or it cannot be formatted.";

      try {
        if (message instanceof Array) {
          if (isNaN(tokens._count)) {
            throw warning;
          }

          message = Bundle.plurals[this.language](message, tokens._count);
        }

        if (message) {
          message = Bundle.format(message, tokens);

          if (message.match(/\{\w+\}/)) {
            throw warning;
          }

          return message;
        }

        throw warning;
      } catch (e) {
        if (window.console) {
          console.warn(e);
        }

        return key;
      }
    }
  }]);

  return Bundle;
}();

Bundle.format = function (message, tokens) {
  return message.replace(/\{(\w+)\}/g, function (match, p1) {
    var token = (tokens || {})[p1];
    return token === undefined ? match : token;
  });
};

// http://bit.ly/1t9zfpu
Bundle.plurals = {
  en: function en(msgs, n) {
    return msgs[n === 1 ? 0 : 1];
  },
  es: function es(msgs, n) {
    return msgs[n === 1 ? 0 : 1];
  },
  ja: function ja(msgs, n) {
    return msgs[0];
  }
};

module.exports = Bundle;

});

require.register("hec-biostamp-core/js/lib/Cache.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Cache = function () {
  function Cache() {
    _classCallCheck(this, Cache);
  }

  _createClass(Cache, [{
    key: "setItem",
    value: function setItem(key, val, once) {
      if (once === true && this.getItem(key) !== undefined) {
        return false;
      }

      if (val === undefined) {
        return false;
      }

      try {
        localStorage.setItem(key, JSON.stringify(val));

        return true;
      }

      // most likely a quota exceeded error
      catch (e) {
        return !!(window.console && console.warn(e));
      }
    }
  }, {
    key: "getItem",
    value: function getItem(key) {
      var val = localStorage.getItem(key);

      if (val !== null) {
        return JSON.parse(val);
      }

      return undefined;
    }
  }, {
    key: "removeItem",
    value: function removeItem(key) {
      if (key in localStorage) {
        localStorage.removeItem(key);
        return true;
      }

      return false;
    }
  }, {
    key: "clear",
    value: function clear(pattern) {
      if (pattern) {
        Object.keys(localStorage).forEach(function (key) {
          if (key.match(pattern)) {
            localStorage.removeItem(key);
          }
        });
      }
    }
  }]);

  return Cache;
}();

module.exports = Cache;

});

require.register("hec-biostamp-core/js/lib/Colors.js", function(exports, require, module) {
"use strict";

var colors = {
  RED: "#e0002b",
  PINK: "#fd8e8e",
  HOT_PINK: "#eb4360",
  ORANGE: "#ff8309",
  GOLD: "#ffb800",
  GREEN: "#7ac724",
  TEAL: "#00afc2",
  TURQUOISE: "#2aceba",
  BLUE: "#0078bc",
  LIGHT_BLUE: "#aad6ed",
  HOT_BLUE: "#009cff",
  SCREEN_BLUE: "#f0f6f9",
  BROWN: "#74603c",
  LIGHT_BROWN: "#ceba95",
  NAVY: "#304561",
  PURPLE: "#9547a1",
  LIGHT_PURPLE: "#c5a7ca",
  GRAY: "#7e8890",
  LIGHT_GRAY: "#e8e8e8",
  SCREEN_GRAY: "#f8f8f8"
};

module.exports = colors;

});

require.register("hec-biostamp-core/js/lib/Emitter.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Emitter = function () {
  function Emitter(obj) {
    _classCallCheck(this, Emitter);

    for (var i in obj) {
      this[i] = obj[i];
    }

    this.listeners = [];
  }

  _createClass(Emitter, [{
    key: "emit",
    value: function emit(name) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var emitted = false;
      var listeners = this.listeners.filter(function (listener) {
        return name === listener.name;
      });

      listeners.forEach(function (listener) {
        listener.callback.apply(listener.context, args);
        emitted = true;

        if (listener.once) {
          this.off(name, listener.callback);
        }
      }, this);

      return emitted;
    }
  }, {
    key: "on",
    value: function on(name, callback, context, once) {
      this.listeners.push({ name: name, callback: callback, context: context, once: once });
    }
  }, {
    key: "once",
    value: function once(name, callback, context) {
      this.on(name, callback, context, true);
    }
  }, {
    key: "off",
    value: function off(name, callback) {
      this.listeners = this.listeners.filter(function (listener) {
        if (!name || listener.name === name && (!callback || listener.callback === callback)) {
          return false;
        }

        return true;
      });
    }
  }]);

  return Emitter;
}();

module.exports = Emitter;

});

require.register("hec-biostamp-core/js/lib/File.js", function(exports, require, module) {
"use strict";

var anchor = document.createElement("a");

var _File = {
  download: function download(name, type, text) {
    var blob = new Blob([text], { type: type });
    var url = URL.createObjectURL(blob);

    if (navigator.msSaveOrOpenBlob) {
      navigator.msSaveBlob(blob, name);
    } else {
      document.body.appendChild(anchor);

      anchor.href = url;
      anchor.download = name;
      anchor.click();

      document.body.removeChild(anchor);
    }

    URL.revokeObjectURL(url);

    return blob.size;
  }
};

module.exports = _File;

});

require.register("hec-biostamp-core/js/lib/Format.js", function(exports, require, module) {
"use strict";

var Loader = require("./Loader");

var _tz = moment.tz.guess() || "GMT";
var _loader = new Loader();

var _hms = function _hms(millis) {
  var t = Math.round(Math.max(0, millis) / 1000) * 1000;
  var h = t / 3600000;
  var m = t / 60000 % 60;
  var s = t / 1000 % 60;

  return [h, m, s];
};

var Format = {
  setLocale: function setLocale(locale) {
    var lang = locale.substr(0, 2).toLowerCase();
    var url = "./vendor/mc/moment/" + moment.version + "/locale/" + lang + ".js";
    var loader = lang === "en" ? Promise.resolve() : _loader.load(url);

    return loader.then(function () {
      moment.locale(locale);
    });
  },
  timezones: function timezones() {
    return ["Asia/Tokyo", "US/Alaska", "US/Aleutian", "US/Arizona", "US/Central", "US/East-Indiana", "US/Eastern", "US/Hawaii", "US/Indiana-Starke", "US/Mountain", "US/Pacific", "US/Samoa", "Canada/Atlantic", "Canada/Central", "Canada/Eastern", "Canada/Mountain", "Canada/Newfoundland", "Canada/Pacific", "Canada/Saskatchewan", "Canada/Yukon", "Etc/GMT+8", "Etc/GMT+1", "Etc/GMT", "Etc/GMT-1", "Etc/GMT-2", "Etc/GMT-3", "Etc/GMT-4"];
  },
  date: function date(_date, tz, format) {
    var formats = {
      "short": "l",
      "long": "ddd, MMM D, YYYY",
      "cal": "MMM YYYY",
      "compact": "M/D"
    };

    return moment(_date).tz(tz || _tz).format(formats[format || "short"]);
  },
  time: function time(date, tz, format) {
    var formats = {
      "short": "h:mm A",
      "medium": "h:mm:ss A",
      "long": "h:mm:ss A z",
      "precise": "h:mm:ss.SSS"
    };

    return moment(date).tz(tz || _tz).format(formats[format || "medium"]);
  },
  datetime: function datetime(date, tz) {
    return moment(date).tz(tz || _tz).format("l, h:mm:ss A z");
  },
  number: function number(n) {
    var precision = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    return n.toLocaleString({}, { minimumFractionDigits: precision, maximumFractionDigits: precision });
  },
  percent: function percent(n, signed) {
    return (signed && n > 0 ? "+" : "") + Math.round(n * 100) + "%";
  },
  name: function name(user, reverse) {
    var first = user.firstName || "...";
    var last = user.lastName || "...";

    return reverse ? [last, first].join(", ") : [first, last].join(" ");
  },
  duration: function duration(millis) {
    var f = function f(n, i) {
      return Math.floor(n) ? Math.floor(n) + "hms".charAt(i) : "";
    };

    return _hms(millis).map(f).join(" ").trim() || "0";
  },
  interval: function interval(millis) {
    var f = function f(n) {
      return ("0" + Math.floor(n)).substr(-2);
    };

    return _hms(millis).map(f).join(":");
  },
  height: function height(meters) {
    var inches = meters * 39.3701;

    var f = Math.floor(inches / 12);
    var i = Math.round(inches % 12);

    if (i === 12) {
      i = 0;
      f++;
    }

    return f + "\u2019 " + i + "\u201D";
  },
  weight: function weight(kilos) {
    var lbs = Math.round(kilos * 2.20462);

    return lbs + " lbs.";
  },
  bmi: function bmi(kilos, meters) {
    return (kilos / Math.pow(meters, 2)).toFixed(1);
  },
  filesize: function filesize(bytes) {
    var power = 1;
    var unit = "KB";

    if (bytes >= Math.pow(1024, 2)) {
      power = 2;
      unit = "MB";
    }

    if (bytes >= Math.pow(1024, 3)) {
      power = 3;
      unit = "GB";
    }

    return (bytes / Math.pow(1024, power)).toFixed(1) + " " + unit;
  },
  angle: function angle(degrees) {
    var precision = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    return degrees.toFixed(degrees % 1 === 0 ? 0 : precision) + "˚";
  },
  temperature: function temperature(celciusDegrees) {
    var unit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "C";
    var precision = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    var degrees = unit === "C" ? celciusDegrees : celciusDegrees * 1.8 + 32;

    return degrees.toFixed(degrees % 1 === 0 ? 0 : precision) + "˚" + unit;
  }
};

module.exports = Format;

});

require.register("hec-biostamp-core/js/lib/Keyboard.js", function(exports, require, module) {
"use strict";

var TAB = 9;
var ENTER = 13;
var SHIFT = 16;
var ESCAPE = 27;
var LEFT = 37;
var UP = 38;
var RIGHT = 39;
var DOWN = 40;

var Keyboard = {
  isEscape: function isEscape(evt) {
    return evt.keyCode === ESCAPE;
  },
  isEnter: function isEnter(evt) {
    return evt.keyCode === ENTER;
  },
  isUpArrow: function isUpArrow(evt) {
    return evt.keyCode === UP;
  },
  isDownArrow: function isDownArrow(evt) {
    return evt.keyCode === DOWN;
  },
  isUpOrDownArrow: function isUpOrDownArrow(evt) {
    return this.isUpArrow(evt) || this.isDownArrow(evt);
  },
  isLeftArrow: function isLeftArrow(evt) {
    return evt.keyCode === LEFT;
  },
  isRightArrow: function isRightArrow(evt) {
    return evt.keyCode === RIGHT;
  },
  isArrow: function isArrow(evt) {
    return this.isUpOrDownArrow(evt) || this.isLeftOrRightArrow(evt);
  },
  isLeftOrRightArrow: function isLeftOrRightArrow(evt) {
    return this.isLeftArrow(evt) || this.isRightArrow(evt);
  },
  isBackTab: function isBackTab(evt) {
    return evt.keyCode === TAB && evt.shiftKey;
  },
  isNextTab: function isNextTab(evt) {
    return evt.keyCode === TAB && !evt.shiftKey;
  },
  isTab: function isTab(evt) {
    return evt.keyCode === TAB;
  },
  isShift: function isShift(evt) {
    return evt.keyCode === SHIFT;
  }
};

module.exports = Keyboard;

});

require.register("hec-biostamp-core/js/lib/Loader.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Loader = function () {
  function Loader() {
    _classCallCheck(this, Loader);

    this.paths = {};
  }

  _createClass(Loader, [{
    key: "load",
    value: function load(path) {
      if (!this.paths[path]) {
        this.paths[path] = new Promise(function (resolve, reject) {
          var elem = void 0;
          var href = path + "?cache=" + Date.now();

          if (path.match(/css$/)) {
            elem = document.createElement("link");
            elem.rel = "stylesheet";
            elem.href = href;
          } else {
            elem = document.createElement("script");
            elem.src = href;
          }

          elem.onload = resolve;
          elem.onerror = reject;

          document.head.appendChild(elem);
        });
      }

      return this.paths[path];
    }
  }]);

  return Loader;
}();

;

module.exports = Loader;

});

require.register("hec-biostamp-core/js/lib/Logger.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var loggers = {};
var levels = ["info", "log", "warn", "error"];

var Logger = function () {
  function Logger(name) {
    var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "info";

    _classCallCheck(this, Logger);

    this.name = name;
    this.entries = [];
    this.setLogLevel(level);
  }

  _createClass(Logger, [{
    key: "setLogLevel",
    value: function setLogLevel(level) {
      levels.forEach(function (fn, i) {
        var prefix = "[" + this.name + ":" + levels[i] + "]";

        this[fn] = function () {};

        if (window.console && i >= levels.indexOf(level) && level !== "none") {
          try {
            this[fn] = console[fn].bind(console, prefix);
          } catch (e) {
            // IE
            this[fn] = Function.prototype.bind.apply(console[fn], [prefix]);
          }
        }
      }, this);
    }
  }, {
    key: "getContext",
    value: function getContext(name) {
      if (!loggers[name]) {
        loggers[name] = new Logger(name, "info");
      }

      return loggers[name];
    }
  }]);

  return Logger;
}();

Logger.getContext = Logger.prototype.getContext;

module.exports = Logger;

});

require.register("hec-biostamp-core/js/lib/Math.js", function(exports, require, module) {
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _Math = {
  round: function round(n, factor) {
    if (factor === 0) {
      return Math.round(n * Math.pow(10, 10)) / Math.pow(10, 10);
    }

    var f = factor || Math.pow(10, Math.floor(Math.log(Math.abs(n)) * Math.LOG10E)) || 1;

    return (n > 0 ? Math.ceil(n / f) : Math.floor(n / f)) / (1 / f);
  },
  rand: function rand(min, max) {
    return min + Math.random() * (max - min);
  },
  filter: function filter(arr, accessor) {
    return arr.map(function (a) {
      if (a instanceof Object) {
        return accessor.call ? accessor(a) : a[accessor];
      }

      return a;
    }).filter(function (a) {
      return a !== undefined && a !== null && !isNaN(a);
    });
  },
  sum: function sum(arr, accessor) {
    var vals = this.filter(arr, accessor);

    return vals.reduce(function (a, b) {
      return a + +b;
    }, 0);
  },
  avg: function avg(arr, accessor) {
    var vals = this.filter(arr, accessor);

    return vals.reduce(function (a, b) {
      return a + +b;
    }, 0) / vals.length;
  },
  median: function median(arr, accessor) {
    var vals = this.filter(arr, accessor).sort(function (a, b) {
      return a > b ? 1 : -1;
    });

    var n = vals.length;

    if (n === 0) {
      return NaN;
    }

    if (n === 1) {
      return +vals[0];
    }

    if (n % 2 === 1) {
      return +vals[Math.floor(n / 2)];
    }

    return (+vals[n / 2] + +vals[n / 2 - 1]) / 2;
  },
  min: function min(arr, accessor) {
    var vals = this.filter(arr, accessor);

    return vals.length ? Math.min.apply(null, vals) : NaN;
  },
  max: function max(arr, accessor) {
    var vals = this.filter(arr, accessor);

    return vals.length ? Math.max.apply(null, vals) : NaN;
  },


  // http://mathworld.wolfram.com/SampleVariance.html
  variance: function variance(arr, accessor) {
    if (arr.length < 2) {
      return NaN;
    }

    var vals = this.filter(arr, accessor);
    var avg = this.avg(vals);
    var sum = this.sum(vals.map(function (val) {
      return Math.pow(val - avg, 2);
    }));

    return sum / (vals.length - 1);
  },
  deviation: function deviation(arr, accessor) {
    return Math.sqrt(this.variance(arr, accessor));
  },


  // http://onlinestatbook.com/2/regression/intro.html
  // http://onlinestatbook.com/2/describing_bivariate_data/calculation.html
  trend: function trend(points) {
    var x = points.map(function (p) {
      return p[0];
    });
    var y = points.map(function (p) {
      return p[1];
    });
    var xMean = this.avg(x);
    var yMean = this.avg(y);
    var xDev = this.deviation(x);
    var yDev = this.deviation(y);
    var xVar = x.map(function (x) {
      return x - xMean;
    });
    var yVar = y.map(function (y) {
      return y - yMean;
    });
    var zip = xVar.map(function (a, i) {
      var b = yVar[i];

      return {
        xy: a * b,
        x2: Math.pow(a, 2),
        y2: Math.pow(b, 2)
      };
    });
    var xySum = this.sum(zip.map(function (z) {
      return z.xy;
    }));
    var x2Sum = this.sum(zip.map(function (z) {
      return z.x2;
    }));
    var y2Sum = this.sum(zip.map(function (z) {
      return z.y2;
    }));

    var r = xySum / Math.sqrt(x2Sum * y2Sum);
    var b = r * (yDev / xDev) || 0;
    var A = yMean - b * xMean || 0;

    return function (x) {
      return b * x + A;
    };
  },


  // https://gist.github.com/matt-west/6500993#gistcomment-2743187
  correlation: function correlation(arr1, arr2) {
    var add = function add(a, b) {
      return a + b;
    };

    var n = Math.min(arr1.length, arr2.length);

    if (n === 0) {
      return 0;
    }

    var _ref = [arr1.slice(0, n), arr2.slice(0, n)],
        d1 = _ref[0],
        d2 = _ref[1];

    var _map = [d1, d2].map(function (l) {
      return l.reduce(add);
    }),
        _map2 = _slicedToArray(_map, 2),
        sum1 = _map2[0],
        sum2 = _map2[1];

    var _map3 = [d1, d2].map(function (l) {
      return l.reduce(function (a, b) {
        return a + Math.pow(b, 2);
      }, 0);
    }),
        _map4 = _slicedToArray(_map3, 2),
        pow1 = _map4[0],
        pow2 = _map4[1];

    var mulSum = d1.map(function (n, i) {
      return n * d2[i];
    }).reduce(add);

    var dense = Math.sqrt((pow1 - Math.pow(sum1, 2) / n) * (pow2 - Math.pow(sum2, 2) / n));

    if (dense === 0) {
      return 0;
    }

    return (mulSum - sum1 * sum2 / n) / dense;
  },
  nearest: function nearest(arr, val, threshold, accessor) {
    var t = threshold || Infinity;
    var a = accessor || function (v) {
      return v;
    };
    var diffs = arr.map(function (v) {
      return Math.abs(a(v) - val);
    });
    var min = Math.min.apply(null, diffs);

    if (min <= Math.abs(t)) {
      return arr[diffs.indexOf(min)];
    }

    return undefined;
  },
  limit: function limit(n, min, max) {
    return Math.max(min, Math.min(n, max));
  },
  ticks: function ticks(yMin, yMax, steps, maxTicks) {
    var _this = this;

    var factors = [].concat(steps).sort(function (a, b) {
      return a - b;
    });
    var a = void 0;
    var b = void 0;
    var len = void 0;

    if (yMin === yMax) {
      return [this.round(yMin - 0.00001, -steps[0]), this.round(yMax + 0.00001, +steps[0])];
    }

    var _loop = function _loop(i, f) {
      a = _this.round(yMin, yMin > 0 ? -f : f);
      b = _this.round(yMax, yMax > 0 ? f : -f);
      len = Math.round((b - a) / f);

      if (len < maxTicks) {
        return {
          v: Array(len + 1).fill(0).map(function (n, i) {
            return a + i * f;
          })
        };
      }
    };

    for (var i = 0, f = 1; i < factors.length, f = factors[i]; i++) {
      var _ret = _loop(i, f);

      if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
    }

    return [a, b];
  },
  duration: function duration(millis) {
    var hours = Math.floor(millis / 3600000);
    var minutes = Math.floor(millis / 60000 % 60);
    var seconds = Math.floor(millis / 1000 % 60);

    return { hours: hours, minutes: minutes, seconds: seconds };
  },
  overlaps: function overlaps(a, b) {
    return Math.max(a[0], b[0]) <= Math.min(a[1], b[1]);
  },


  POUNDS_PER_KILO: 2.20462,

  KILOS_PER_POUND: 0.453592,

  METERS_PER_INCH: 0.0254,

  INCHES_PER_METER: 39.3701,

  MILLIS_PER_MINUTE: 60000,

  MILLIS_PER_HOUR: 3600000,

  MILLIS_PER_DAY: 86400000
};

module.exports = _Math;

});

require.register("hec-biostamp-core/js/lib/Router.js", function(exports, require, module) {
"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Router = function () {
  function Router() {
    _classCallCheck(this, Router);

    this._routes = [];
    this._route;
    this._params;
    this._last = "/";
    this._prompt = function () {
      return Promise.resolve();
    };
    this._prompting = false;
    this._doPrompt = function () {
      return false;
    };
    this._fallback = function () {
      return null;
    };
    this._history = [];
  }

  _createClass(Router, [{
    key: "_onHashChange",
    value: function _onHashChange(evt) {
      var _this = this;

      if (this._prompting) {
        return;
      }

      var hash = location.hash;
      var route = this._routes.find(function (r) {
        return r.pattern.test(hash);
      });

      if (route !== this._route) {
        this._route = route;
        window.scrollTo(0, 0);
      }

      if (route) {
        this._history.unshift({ id: route.id, hash: hash });

        var params = {};
        var matches = hash.match(route.pattern);
        var promise = this._doPrompt() ? (this._prompting = true) && this._prompt() : Promise.resolve();

        this._params = params;

        route.tokens.forEach(function (token, i) {
          var str = matches[i + 1];
          params[token.substr(1)] = str.match("=") ? _this._decode(str) : decodeURI(str);
        });

        return promise.then(function () {
          _this._doPrompt = function () {
            return false;
          };
          _this._prompting = false;
          _this._last = hash;

          route.callback(params, route.route, route.id);
        }).catch(function () {
          _this._setHash(_this._last);

          setTimeout(function () {
            _this._prompting = false;
          }, 100);
        });
      }

      this._fallback();
    }
  }, {
    key: "_setHash",
    value: function _setHash(hash) {
      location.hash = hash;
    }
  }, {
    key: "_encode",
    value: function _encode(obj) {
      var params = Object.keys(obj).map(function (key) {
        return encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]);
      });

      return params.join("&");
    }
  }, {
    key: "_decode",
    value: function _decode(str) {
      var params = {};

      str.match("=") && str.split("&").map(function (param) {
        return param.split("=");
      }).forEach(function (args) {
        params[decodeURIComponent(args[0])] = decodeURIComponent(args[1]);
      });

      return params;
    }
  }, {
    key: "on",
    value: function on(route, id, callback) {
      var _route = route.replace(/!\w+/g, "");

      this._routes.push({
        route: _route,
        id: id,
        callback: callback,
        tokens: _route.match(/\:\w+/g) || [],
        pattern: new RegExp("#" + _route.replace(/\:\w+/g, "([\\w\-\_\+\.%=&]+)") + "$")
      });
    }
  }, {
    key: "setFallback",
    value: function setFallback(fallback) {
      this._fallback = fallback;
    }
  }, {
    key: "start",
    value: function start(initPath, redirect) {
      window.addEventListener("hashchange", this._onHashChange.bind(this));

      if (initPath && (redirect || location.hash === "")) {
        this._setHash(initPath);
      }

      this._onHashChange(null);
    }
  }, {
    key: "resolve",
    value: function resolve(id) {
      var _this2 = this;

      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var route = this._routes.find(function (r) {
        return r.id === id;
      });

      if (route) {
        return "#" + route.route.replace(/\:\w+/g, function (match) {
          var param = params[match.substr(1)];
          return param && (typeof param === "undefined" ? "undefined" : _typeof(param)) === "object" ? _this2._encode(param) : encodeURI(param);
        });
      }
    }
  }, {
    key: "trigger",
    value: function trigger(id, params) {
      var hash = this.resolve(id, params);

      if (hash === location.hash) {
        this._onHashChange(null);
        return;
      }

      if (hash) {
        this._setHash(hash);
        return hash;
      }
    }
  }, {
    key: "id",
    value: function id(hash) {
      var route = this._routes.find(function (r) {
        return r.pattern.test(hash || location.hash);
      });

      return route ? route.id : null;
    }
  }, {
    key: "params",
    value: function params() {
      return this._params;
    }
  }, {
    key: "referrer",
    value: function referrer() {
      var id = this.id();

      if (id) {
        var referrer = this._history.find(function (entry) {
          return entry.id !== id;
        });

        if (referrer) {
          return referrer;
        }
      }

      return null;
    }
  }, {
    key: "refresh",
    value: function refresh(newParams) {
      this.trigger(this._route.id, _extends({}, this._params, newParams));
    }
  }, {
    key: "setPrompt",
    value: function setPrompt(prompt) {
      this._prompt = prompt;
    }
  }, {
    key: "doPrompt",
    value: function doPrompt(_doPrompt) {
      this._doPrompt = typeof _doPrompt === "boolean" ? function () {
        return _doPrompt;
      } : _doPrompt;
    }
  }]);

  return Router;
}();

module.exports = Router;

});

require.register("hec-biostamp-core/js/lib/Server.js", function(exports, require, module) {
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Server = function Server(hostname, environment) {
  _classCallCheck(this, Server);

  // local
  var env = "dev";
  var api = "http://localhost:9000/v1";

  // test, int, or qa
  if (environment) {
    env = environment;
    api = "https://" + env + ".mc10cloud.com/api/v1";
  }
  // other mc10 domain
  else if (/mc10cloud.com$/.test(hostname)) {
      env = (hostname.match(/^(\w+).mc10cloud.com/) || [])[1];
      env = env === undefined || env === "www" ? "prod" : env;
      api = "https://" + hostname + "/api/v1";
    }

  this.ENV = env;
  this.API = api;
};

module.exports = Server;

});

require.register("hec-biostamp-core/js/lib/State.js", function(exports, require, module) {
"use strict";

var State = {
  createStore: function createStore(reducers, initState) {
    var promiseMiddleware = function promiseMiddleware(store) {
      return function (next) {
        return function (action) {
          if (typeof action.then === "function") {
            return action.then(store.dispatch).catch(function (err) {
              console.error(err.toString());
            });
          }

          return next(action);
        };
      };
    };

    var reducer = function reducer(state, action) {
      var fn = reducers[action.type];

      if (fn) {
        return fn(state, action);
      }

      return state;
    };

    return Redux.createStore(reducer, initState, Redux.applyMiddleware(promiseMiddleware));
  },
  bindActions: function bindActions(actions, store) {
    return Redux.bindActionCreators(actions, store.dispatch);
  }
};

module.exports = State;

});

require.register("hec-biostamp-core/js/lib/TimeZone.js", function(exports, require, module) {
"use strict";

var TimeZone = {
  info: function info(date, tz, round) {
    var mom = moment(date).tz(tz || "GMT");
    var obj = void 0;
    var hour = {
      "DAY_START": 0,
      "DAY_END": 24,
      "HOUR_START": mom.hour(),
      "HOUR_END": mom.hour() + 1
    };

    if (round) {
      mom.hour(hour[round]).minute(0).second(0).millisecond(0);
    }

    obj = mom.toObject();
    obj.offset = mom.utcOffset() * 60000;
    obj.zoneAbbr = mom.zoneAbbr();
    obj.zoneName = mom.zoneName();
    obj.iso = mom.toISOString();
    obj.value = mom.valueOf();

    return obj;
  }
};

module.exports = TimeZone;

});

require.register("hec-biostamp-core/js/lib/Utils.js", function(exports, require, module) {
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var utils = {
  // https://www.w3resource.com/javascript-exercises/javascript-math-exercise-23.php
  id: function id() {
    var t = Date.now();

    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (t + Math.random() * 16) % 16 | 0;

      t = Math.floor(t / 16);

      return (c === "x" ? r : r & 0x3 | 0x8).toString(16);
    });
  },
  clone: function clone(obj) {
    // ugh
    return JSON.parse(JSON.stringify(obj));
  },
  prune: function prune(obj, keys) {
    var copy = {};

    keys.forEach(function (k) {
      copy[k] = obj[k];
    });

    return copy;
  },
  hash: function hash(arr, key) {
    var obj = {};

    arr.forEach(function (o) {
      obj[o[key]] = o;
    });

    return obj;
  },
  filter: function filter(list, fields, term) {
    var t = term.trim().toLowerCase().replace(/[\\,]/g, "");

    if (t.length) {
      return list.filter(function (item) {
        var s = fields.reduce(function (a, b) {
          return a + (item[b] || "");
        }, "").toLowerCase();

        return !!t.split(/\s+/).every(function (t) {
          return s.indexOf(t) > -1;
        });
      });
    }

    return list;
  },
  flatten: function flatten(list) {
    // eslint-disable-next-line prefer-spread
    return Array.prototype.flat ? list.flat() : [].concat.apply([], list);
  },
  bisect: function bisect(list, accessor) {
    var i = list.findIndex(accessor);

    if (i > -1) {
      return [list.slice(0, i), list.slice(i + 1)];
    }

    return [[], []];
  },
  page: function page(list, accessor) {
    var _bisect = this.bisect(list, accessor),
        _bisect2 = _slicedToArray(_bisect, 2),
        a = _bisect2[0],
        b = _bisect2[1];

    return [a.length ? a[a.length - 1] : null, b.length ? b[0] : null];
  },
  distinct: function distinct(list) {
    if (Array.from) {
      return Array.from(new Set(list));
    }

    // IE 11
    var result = [];

    list.forEach(function (item) {
      if (result.indexOf(item) === -1) {
        result.push(item);
      }
    });

    return result;
  },
  equals: function equals(a, b) {
    return Object.keys(b).every(function (key) {
      return a[key] === b[key];
    });
  },
  sortIgnoreCase: function sortIgnoreCase(accessor) {
    return function (a, b) {
      return accessor(a).toLowerCase() > accessor(b).toLowerCase() ? 1 : -1;
    };
  },
  chain: function chain(commands) {
    var chain = Promise.resolve();
    var sequence = [].concat(commands);

    if (sequence.length) {
      chain = sequence.shift().call();

      while (sequence.length) {
        chain = chain.then(sequence.shift());
      }
    }

    return chain;
  }
};

module.exports = utils;

});

require.register("hec-biostamp-core/js/lib/Wait.js", function(exports, require, module) {
"use strict";

var Wait = function Wait() {
  var millis = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1000;

  return new Promise(function (resolve, reject) {
    setTimeout(resolve, millis);
  });
};

module.exports = Wait;

});

require.register("hec-biostamp-core/js/lib/es6-promise.js", function(exports, require, module) {
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
 * @version   2.1.1
 */

(function () {
  function lib$es6$promise$utils$$objectOrFunction(x) {
    return typeof x === 'function' || (typeof x === 'undefined' ? 'undefined' : _typeof(x)) === 'object' && x !== null;
  }

  function lib$es6$promise$utils$$isFunction(x) {
    return typeof x === 'function';
  }

  function lib$es6$promise$utils$$isMaybeThenable(x) {
    return (typeof x === 'undefined' ? 'undefined' : _typeof(x)) === 'object' && x !== null;
  }

  var lib$es6$promise$utils$$_isArray;
  if (!Array.isArray) {
    lib$es6$promise$utils$$_isArray = function lib$es6$promise$utils$$_isArray(x) {
      return Object.prototype.toString.call(x) === '[object Array]';
    };
  } else {
    lib$es6$promise$utils$$_isArray = Array.isArray;
  }

  var lib$es6$promise$utils$$isArray = lib$es6$promise$utils$$_isArray;
  var lib$es6$promise$asap$$len = 0;
  var lib$es6$promise$asap$$toString = {}.toString;
  var lib$es6$promise$asap$$vertxNext;
  function lib$es6$promise$asap$$asap(callback, arg) {
    lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len] = callback;
    lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len + 1] = arg;
    lib$es6$promise$asap$$len += 2;
    if (lib$es6$promise$asap$$len === 2) {
      // If len is 2, that means that we need to schedule an async flush.
      // If additional callbacks are queued before the queue is flushed, they
      // will be processed by this flush that we are scheduling.
      lib$es6$promise$asap$$scheduleFlush();
    }
  }

  var lib$es6$promise$asap$$default = lib$es6$promise$asap$$asap;

  var lib$es6$promise$asap$$browserWindow = typeof window !== 'undefined' ? window : undefined;
  var lib$es6$promise$asap$$browserGlobal = lib$es6$promise$asap$$browserWindow || {};
  var lib$es6$promise$asap$$BrowserMutationObserver = lib$es6$promise$asap$$browserGlobal.MutationObserver || lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;
  var lib$es6$promise$asap$$isNode = typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

  // test for web worker but not in IE10
  var lib$es6$promise$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

  // node
  function lib$es6$promise$asap$$useNextTick() {
    var nextTick = process.nextTick;
    // node version 0.10.x displays a deprecation warning when nextTick is used recursively
    // setImmediate should be used instead instead
    var version = process.versions.node.match(/^(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$/);
    if (Array.isArray(version) && version[1] === '0' && version[2] === '10') {
      nextTick = setImmediate;
    }
    return function () {
      nextTick(lib$es6$promise$asap$$flush);
    };
  }

  // vertx
  function lib$es6$promise$asap$$useVertxTimer() {
    return function () {
      lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);
    };
  }

  function lib$es6$promise$asap$$useMutationObserver() {
    var iterations = 0;
    var observer = new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);
    var node = document.createTextNode('');
    observer.observe(node, { characterData: true });

    return function () {
      node.data = iterations = ++iterations % 2;
    };
  }

  // web worker
  function lib$es6$promise$asap$$useMessageChannel() {
    var channel = new MessageChannel();
    channel.port1.onmessage = lib$es6$promise$asap$$flush;
    return function () {
      channel.port2.postMessage(0);
    };
  }

  function lib$es6$promise$asap$$useSetTimeout() {
    return function () {
      setTimeout(lib$es6$promise$asap$$flush, 1);
    };
  }

  var lib$es6$promise$asap$$queue = new Array(1000);
  function lib$es6$promise$asap$$flush() {
    for (var i = 0; i < lib$es6$promise$asap$$len; i += 2) {
      var callback = lib$es6$promise$asap$$queue[i];
      var arg = lib$es6$promise$asap$$queue[i + 1];

      callback(arg);

      lib$es6$promise$asap$$queue[i] = undefined;
      lib$es6$promise$asap$$queue[i + 1] = undefined;
    }

    lib$es6$promise$asap$$len = 0;
  }

  function lib$es6$promise$asap$$attemptVertex() {
    try {
      var r = require;
      var vertx = r('vertx');
      lib$es6$promise$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
      return lib$es6$promise$asap$$useVertxTimer();
    } catch (e) {
      return lib$es6$promise$asap$$useSetTimeout();
    }
  }

  var lib$es6$promise$asap$$scheduleFlush;
  // Decide what async method to use to triggering processing of queued callbacks:
  if (lib$es6$promise$asap$$isNode) {
    lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useNextTick();
  } else if (lib$es6$promise$asap$$BrowserMutationObserver) {
    lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMutationObserver();
  } else if (lib$es6$promise$asap$$isWorker) {
    lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMessageChannel();
  } else if (lib$es6$promise$asap$$browserWindow === undefined && typeof require === 'function') {
    lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$attemptVertex();
  } else {
    lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useSetTimeout();
  }

  function lib$es6$promise$$internal$$noop() {}

  var lib$es6$promise$$internal$$PENDING = void 0;
  var lib$es6$promise$$internal$$FULFILLED = 1;
  var lib$es6$promise$$internal$$REJECTED = 2;

  var lib$es6$promise$$internal$$GET_THEN_ERROR = new lib$es6$promise$$internal$$ErrorObject();

  function lib$es6$promise$$internal$$selfFullfillment() {
    return new TypeError("You cannot resolve a promise with itself");
  }

  function lib$es6$promise$$internal$$cannotReturnOwn() {
    return new TypeError('A promises callback cannot return that same promise.');
  }

  function lib$es6$promise$$internal$$getThen(promise) {
    try {
      return promise.then;
    } catch (error) {
      lib$es6$promise$$internal$$GET_THEN_ERROR.error = error;
      return lib$es6$promise$$internal$$GET_THEN_ERROR;
    }
  }

  function lib$es6$promise$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
    try {
      then.call(value, fulfillmentHandler, rejectionHandler);
    } catch (e) {
      return e;
    }
  }

  function lib$es6$promise$$internal$$handleForeignThenable(promise, thenable, then) {
    lib$es6$promise$asap$$default(function (promise) {
      var sealed = false;
      var error = lib$es6$promise$$internal$$tryThen(then, thenable, function (value) {
        if (sealed) {
          return;
        }
        sealed = true;
        if (thenable !== value) {
          lib$es6$promise$$internal$$resolve(promise, value);
        } else {
          lib$es6$promise$$internal$$fulfill(promise, value);
        }
      }, function (reason) {
        if (sealed) {
          return;
        }
        sealed = true;

        lib$es6$promise$$internal$$reject(promise, reason);
      }, 'Settle: ' + (promise._label || ' unknown promise'));

      if (!sealed && error) {
        sealed = true;
        lib$es6$promise$$internal$$reject(promise, error);
      }
    }, promise);
  }

  function lib$es6$promise$$internal$$handleOwnThenable(promise, thenable) {
    if (thenable._state === lib$es6$promise$$internal$$FULFILLED) {
      lib$es6$promise$$internal$$fulfill(promise, thenable._result);
    } else if (thenable._state === lib$es6$promise$$internal$$REJECTED) {
      lib$es6$promise$$internal$$reject(promise, thenable._result);
    } else {
      lib$es6$promise$$internal$$subscribe(thenable, undefined, function (value) {
        lib$es6$promise$$internal$$resolve(promise, value);
      }, function (reason) {
        lib$es6$promise$$internal$$reject(promise, reason);
      });
    }
  }

  function lib$es6$promise$$internal$$handleMaybeThenable(promise, maybeThenable) {
    if (maybeThenable.constructor === promise.constructor) {
      lib$es6$promise$$internal$$handleOwnThenable(promise, maybeThenable);
    } else {
      var then = lib$es6$promise$$internal$$getThen(maybeThenable);

      if (then === lib$es6$promise$$internal$$GET_THEN_ERROR) {
        lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$GET_THEN_ERROR.error);
      } else if (then === undefined) {
        lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
      } else if (lib$es6$promise$utils$$isFunction(then)) {
        lib$es6$promise$$internal$$handleForeignThenable(promise, maybeThenable, then);
      } else {
        lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
      }
    }
  }

  function lib$es6$promise$$internal$$resolve(promise, value) {
    if (promise === value) {
      lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$selfFullfillment());
    } else if (lib$es6$promise$utils$$objectOrFunction(value)) {
      lib$es6$promise$$internal$$handleMaybeThenable(promise, value);
    } else {
      lib$es6$promise$$internal$$fulfill(promise, value);
    }
  }

  function lib$es6$promise$$internal$$publishRejection(promise) {
    if (promise._onerror) {
      promise._onerror(promise._result);
    }

    lib$es6$promise$$internal$$publish(promise);
  }

  function lib$es6$promise$$internal$$fulfill(promise, value) {
    if (promise._state !== lib$es6$promise$$internal$$PENDING) {
      return;
    }

    promise._result = value;
    promise._state = lib$es6$promise$$internal$$FULFILLED;

    if (promise._subscribers.length !== 0) {
      lib$es6$promise$asap$$default(lib$es6$promise$$internal$$publish, promise);
    }
  }

  function lib$es6$promise$$internal$$reject(promise, reason) {
    if (promise._state !== lib$es6$promise$$internal$$PENDING) {
      return;
    }
    promise._state = lib$es6$promise$$internal$$REJECTED;
    promise._result = reason;

    lib$es6$promise$asap$$default(lib$es6$promise$$internal$$publishRejection, promise);
  }

  function lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
    var subscribers = parent._subscribers;
    var length = subscribers.length;

    parent._onerror = null;

    subscribers[length] = child;
    subscribers[length + lib$es6$promise$$internal$$FULFILLED] = onFulfillment;
    subscribers[length + lib$es6$promise$$internal$$REJECTED] = onRejection;

    if (length === 0 && parent._state) {
      lib$es6$promise$asap$$default(lib$es6$promise$$internal$$publish, parent);
    }
  }

  function lib$es6$promise$$internal$$publish(promise) {
    var subscribers = promise._subscribers;
    var settled = promise._state;

    if (subscribers.length === 0) {
      return;
    }

    var child,
        callback,
        detail = promise._result;

    for (var i = 0; i < subscribers.length; i += 3) {
      child = subscribers[i];
      callback = subscribers[i + settled];

      if (child) {
        lib$es6$promise$$internal$$invokeCallback(settled, child, callback, detail);
      } else {
        callback(detail);
      }
    }

    promise._subscribers.length = 0;
  }

  function lib$es6$promise$$internal$$ErrorObject() {
    this.error = null;
  }

  var lib$es6$promise$$internal$$TRY_CATCH_ERROR = new lib$es6$promise$$internal$$ErrorObject();

  function lib$es6$promise$$internal$$tryCatch(callback, detail) {
    try {
      return callback(detail);
    } catch (e) {
      lib$es6$promise$$internal$$TRY_CATCH_ERROR.error = e;
      return lib$es6$promise$$internal$$TRY_CATCH_ERROR;
    }
  }

  function lib$es6$promise$$internal$$invokeCallback(settled, promise, callback, detail) {
    var hasCallback = lib$es6$promise$utils$$isFunction(callback),
        value,
        error,
        succeeded,
        failed;

    if (hasCallback) {
      value = lib$es6$promise$$internal$$tryCatch(callback, detail);

      if (value === lib$es6$promise$$internal$$TRY_CATCH_ERROR) {
        failed = true;
        error = value.error;
        value = null;
      } else {
        succeeded = true;
      }

      if (promise === value) {
        lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$cannotReturnOwn());
        return;
      }
    } else {
      value = detail;
      succeeded = true;
    }

    if (promise._state !== lib$es6$promise$$internal$$PENDING) {
      // noop
    } else if (hasCallback && succeeded) {
      lib$es6$promise$$internal$$resolve(promise, value);
    } else if (failed) {
      lib$es6$promise$$internal$$reject(promise, error);
    } else if (settled === lib$es6$promise$$internal$$FULFILLED) {
      lib$es6$promise$$internal$$fulfill(promise, value);
    } else if (settled === lib$es6$promise$$internal$$REJECTED) {
      lib$es6$promise$$internal$$reject(promise, value);
    }
  }

  function lib$es6$promise$$internal$$initializePromise(promise, resolver) {
    try {
      resolver(function resolvePromise(value) {
        lib$es6$promise$$internal$$resolve(promise, value);
      }, function rejectPromise(reason) {
        lib$es6$promise$$internal$$reject(promise, reason);
      });
    } catch (e) {
      lib$es6$promise$$internal$$reject(promise, e);
    }
  }

  function lib$es6$promise$enumerator$$Enumerator(Constructor, input) {
    var enumerator = this;

    enumerator._instanceConstructor = Constructor;
    enumerator.promise = new Constructor(lib$es6$promise$$internal$$noop);

    if (enumerator._validateInput(input)) {
      enumerator._input = input;
      enumerator.length = input.length;
      enumerator._remaining = input.length;

      enumerator._init();

      if (enumerator.length === 0) {
        lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
      } else {
        enumerator.length = enumerator.length || 0;
        enumerator._enumerate();
        if (enumerator._remaining === 0) {
          lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
        }
      }
    } else {
      lib$es6$promise$$internal$$reject(enumerator.promise, enumerator._validationError());
    }
  }

  lib$es6$promise$enumerator$$Enumerator.prototype._validateInput = function (input) {
    return lib$es6$promise$utils$$isArray(input);
  };

  lib$es6$promise$enumerator$$Enumerator.prototype._validationError = function () {
    return new Error('Array Methods must be provided an Array');
  };

  lib$es6$promise$enumerator$$Enumerator.prototype._init = function () {
    this._result = new Array(this.length);
  };

  var lib$es6$promise$enumerator$$default = lib$es6$promise$enumerator$$Enumerator;

  lib$es6$promise$enumerator$$Enumerator.prototype._enumerate = function () {
    var enumerator = this;

    var length = enumerator.length;
    var promise = enumerator.promise;
    var input = enumerator._input;

    for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
      enumerator._eachEntry(input[i], i);
    }
  };

  lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry = function (entry, i) {
    var enumerator = this;
    var c = enumerator._instanceConstructor;

    if (lib$es6$promise$utils$$isMaybeThenable(entry)) {
      if (entry.constructor === c && entry._state !== lib$es6$promise$$internal$$PENDING) {
        entry._onerror = null;
        enumerator._settledAt(entry._state, i, entry._result);
      } else {
        enumerator._willSettleAt(c.resolve(entry), i);
      }
    } else {
      enumerator._remaining--;
      enumerator._result[i] = entry;
    }
  };

  lib$es6$promise$enumerator$$Enumerator.prototype._settledAt = function (state, i, value) {
    var enumerator = this;
    var promise = enumerator.promise;

    if (promise._state === lib$es6$promise$$internal$$PENDING) {
      enumerator._remaining--;

      if (state === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, value);
      } else {
        enumerator._result[i] = value;
      }
    }

    if (enumerator._remaining === 0) {
      lib$es6$promise$$internal$$fulfill(promise, enumerator._result);
    }
  };

  lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt = function (promise, i) {
    var enumerator = this;

    lib$es6$promise$$internal$$subscribe(promise, undefined, function (value) {
      enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED, i, value);
    }, function (reason) {
      enumerator._settledAt(lib$es6$promise$$internal$$REJECTED, i, reason);
    });
  };
  function lib$es6$promise$promise$all$$all(entries) {
    return new lib$es6$promise$enumerator$$default(this, entries).promise;
  }
  var lib$es6$promise$promise$all$$default = lib$es6$promise$promise$all$$all;
  function lib$es6$promise$promise$race$$race(entries) {
    /*jshint validthis:true */
    var Constructor = this;

    var promise = new Constructor(lib$es6$promise$$internal$$noop);

    if (!lib$es6$promise$utils$$isArray(entries)) {
      lib$es6$promise$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
      return promise;
    }

    var length = entries.length;

    function onFulfillment(value) {
      lib$es6$promise$$internal$$resolve(promise, value);
    }

    function onRejection(reason) {
      lib$es6$promise$$internal$$reject(promise, reason);
    }

    for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
      lib$es6$promise$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
    }

    return promise;
  }
  var lib$es6$promise$promise$race$$default = lib$es6$promise$promise$race$$race;
  function lib$es6$promise$promise$resolve$$resolve(object) {
    /*jshint validthis:true */
    var Constructor = this;

    if (object && (typeof object === 'undefined' ? 'undefined' : _typeof(object)) === 'object' && object.constructor === Constructor) {
      return object;
    }

    var promise = new Constructor(lib$es6$promise$$internal$$noop);
    lib$es6$promise$$internal$$resolve(promise, object);
    return promise;
  }
  var lib$es6$promise$promise$resolve$$default = lib$es6$promise$promise$resolve$$resolve;
  function lib$es6$promise$promise$reject$$reject(reason) {
    /*jshint validthis:true */
    var Constructor = this;
    var promise = new Constructor(lib$es6$promise$$internal$$noop);
    lib$es6$promise$$internal$$reject(promise, reason);
    return promise;
  }
  var lib$es6$promise$promise$reject$$default = lib$es6$promise$promise$reject$$reject;

  var lib$es6$promise$promise$$counter = 0;

  function lib$es6$promise$promise$$needsResolver() {
    throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
  }

  function lib$es6$promise$promise$$needsNew() {
    throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
  }

  var lib$es6$promise$promise$$default = lib$es6$promise$promise$$Promise;
  /**
    Promise objects represent the eventual result of an asynchronous operation. The
    primary way of interacting with a promise is through its `then` method, which
    registers callbacks to receive either a promise’s eventual value or the reason
    why the promise cannot be fulfilled.
     Terminology
    -----------
     - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
    - `thenable` is an object or function that defines a `then` method.
    - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
    - `exception` is a value that is thrown using the throw statement.
    - `reason` is a value that indicates why a promise was rejected.
    - `settled` the final resting state of a promise, fulfilled or rejected.
     A promise can be in one of three states: pending, fulfilled, or rejected.
     Promises that are fulfilled have a fulfillment value and are in the fulfilled
    state.  Promises that are rejected have a rejection reason and are in the
    rejected state.  A fulfillment value is never a thenable.
     Promises can also be said to *resolve* a value.  If this value is also a
    promise, then the original promise's settled state will match the value's
    settled state.  So a promise that *resolves* a promise that rejects will
    itself reject, and a promise that *resolves* a promise that fulfills will
    itself fulfill.
      Basic Usage:
    ------------
     ```js
    var promise = new Promise(function(resolve, reject) {
      // on success
      resolve(value);
       // on failure
      reject(reason);
    });
     promise.then(function(value) {
      // on fulfillment
    }, function(reason) {
      // on rejection
    });
    ```
     Advanced Usage:
    ---------------
     Promises shine when abstracting away asynchronous interactions such as
    `XMLHttpRequest`s.
     ```js
    function getJSON(url) {
      return new Promise(function(resolve, reject){
        var xhr = new XMLHttpRequest();
         xhr.open('GET', url);
        xhr.onreadystatechange = handler;
        xhr.responseType = 'json';
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.send();
         function handler() {
          if (this.readyState === this.DONE) {
            if (this.status === 200) {
              resolve(this.response);
            } else {
              reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
            }
          }
        };
      });
    }
     getJSON('/posts.json').then(function(json) {
      // on fulfillment
    }, function(reason) {
      // on rejection
    });
    ```
     Unlike callbacks, promises are great composable primitives.
     ```js
    Promise.all([
      getJSON('/posts'),
      getJSON('/comments')
    ]).then(function(values){
      values[0] // => postsJSON
      values[1] // => commentsJSON
       return values;
    });
    ```
     @class Promise
    @param {function} resolver
    Useful for tooling.
    @constructor
  */
  function lib$es6$promise$promise$$Promise(resolver) {
    this._id = lib$es6$promise$promise$$counter++;
    this._state = undefined;
    this._result = undefined;
    this._subscribers = [];

    if (lib$es6$promise$$internal$$noop !== resolver) {
      if (!lib$es6$promise$utils$$isFunction(resolver)) {
        lib$es6$promise$promise$$needsResolver();
      }

      if (!(this instanceof lib$es6$promise$promise$$Promise)) {
        lib$es6$promise$promise$$needsNew();
      }

      lib$es6$promise$$internal$$initializePromise(this, resolver);
    }
  }

  lib$es6$promise$promise$$Promise.all = lib$es6$promise$promise$all$$default;
  lib$es6$promise$promise$$Promise.race = lib$es6$promise$promise$race$$default;
  lib$es6$promise$promise$$Promise.resolve = lib$es6$promise$promise$resolve$$default;
  lib$es6$promise$promise$$Promise.reject = lib$es6$promise$promise$reject$$default;

  lib$es6$promise$promise$$Promise.prototype = {
    constructor: lib$es6$promise$promise$$Promise,

    /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.
       ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```
       Chaining
      --------
       The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.
       ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });
       findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
       ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```
       Assimilation
      ------------
       Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.
       ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```
       If the assimliated promise rejects, then the downstream promise will also reject.
       ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```
       Simple Example
      --------------
       Synchronous Example
       ```javascript
      var result;
       try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```
       Errback Example
       ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```
       Promise Example;
       ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```
       Advanced Example
      --------------
       Synchronous Example
       ```javascript
      var author, books;
       try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```
       Errback Example
       ```js
       function foundBooks(books) {
       }
       function failure(reason) {
       }
       findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```
       Promise Example;
       ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```
       @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      Useful for tooling.
      @return {Promise}
    */
    then: function then(onFulfillment, onRejection) {
      var parent = this;
      var state = parent._state;

      if (state === lib$es6$promise$$internal$$FULFILLED && !onFulfillment || state === lib$es6$promise$$internal$$REJECTED && !onRejection) {
        return this;
      }

      var child = new this.constructor(lib$es6$promise$$internal$$noop);
      var result = parent._result;

      if (state) {
        var callback = arguments[state - 1];
        lib$es6$promise$asap$$default(function () {
          lib$es6$promise$$internal$$invokeCallback(state, child, callback, result);
        });
      } else {
        lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection);
      }

      return child;
    },

    /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.
       ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }
       // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }
       // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```
       @method catch
      @param {Function} onRejection
      Useful for tooling.
      @return {Promise}
    */
    'catch': function _catch(onRejection) {
      return this.then(null, onRejection);
    }
  };
  function lib$es6$promise$polyfill$$polyfill() {
    var local;

    if (typeof global !== 'undefined') {
      local = global;
    } else if (typeof self !== 'undefined') {
      local = self;
    } else {
      try {
        local = Function('return this')();
      } catch (e) {
        throw new Error('polyfill failed because global object is unavailable in this environment');
      }
    }

    var P = local.Promise;

    if (P && Object.prototype.toString.call(P.resolve()) === '[object Promise]' && !P.cast) {
      return;
    }
    local.Promise = lib$es6$promise$promise$$default;
  }
  var lib$es6$promise$polyfill$$default = lib$es6$promise$polyfill$$polyfill;

  var lib$es6$promise$umd$$ES6Promise = {
    'Promise': lib$es6$promise$promise$$default,
    'polyfill': lib$es6$promise$polyfill$$default
  };

  /* global define:true module:true window: true */
  if (typeof define === 'function' && define['amd']) {
    define(function () {
      return lib$es6$promise$umd$$ES6Promise;
    });
  } else if (typeof module !== 'undefined' && module['exports']) {
    module['exports'] = lib$es6$promise$umd$$ES6Promise;
  } else if (typeof this !== 'undefined') {
    this['ES6Promise'] = lib$es6$promise$umd$$ES6Promise;
  }

  lib$es6$promise$polyfill$$default();
}).call(undefined);

});

require.register("hec-biostamp-core/js/mc-charts.js", function(exports, require, module) {
"use strict";

var charts = {
  BarChart: require("./chart/BarChart"),
  LineChart: require("./chart/LineChart"),
  PieChart: require("./chart/PieChart"),
  Legend: require("./chart/Legend")
};

module.exports = charts;

});

require.register("hec-biostamp-core/js/mc-plot.js", function(exports, require, module) {
"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var transforms = require("./plot/PlotTransforms");

var plot = {
  Plot: require("./plot/Plot"),
  XAxis: require("./plot/PlotXAxis"),
  YAxis: require("./plot/PlotYAxis"),
  Line: require("./plot/PlotLine"),
  RasterLine: require("./plot/PlotRasterLine"),
  Bars: require("./plot/PlotBars"),
  Area: require("./plot/PlotArea"),
  Scatter: require("./plot/PlotScatter"),
  RasterScatter: require("./plot/PlotRasterScatter"),
  CSVDownload: require("./plot/PlotCSVDownload")
};

module.exports = _extends({}, plot, transforms);

});

require.register("hec-biostamp-core/js/mc-ui.js", function(exports, require, module) {
"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var Emitter = require("./lib/Emitter");
var colors = require("./lib/Colors");
var keyboard = require("./lib/Keyboard");
var wait = require("./lib/Wait");

var Spinner = require("./widget/Spinner");
var Tooltip = require("./widget/Tooltip");
var Alert = require("./widget/Alert");
var Blast = require("./widget/Blast");
var Modal = require("./widget/Modal");

var LegalView = require("./view/LegalView");
var ErrorView = require("./view/ErrorView");
var HelpView = require("./view/HelpView");

var mounts = {};
var mount = function mount(id, insertBefore) {
  if (!mounts[id]) {
    var div = document.createElement("div");
    div.id = id;

    if (insertBefore) {
      mounts[id] = document.body.insertBefore(div, document.body.firstChild);
    } else {
      mounts[id] = document.body.appendChild(div);
    }
  }

  return mounts[id];
};

var _tooltip = void 0;
var _spinner = void 0;
var _alert = void 0;
var _blast = void 0;
var _modal = void 0;

var ui = new Emitter({
  // show or hide a "loading" indicator
  spin: function spin(n, message) {
    var component = React.createElement(Spinner, null);
    _spinner = ReactDOM.render(component, mount("mc-spinner-mount"));
    _spinner.spin(n, message);
  },

  // show a custom alert
  alert: function alert(message, opts) {
    var component = void 0;
    var props = opts || {};

    if (!message) {
      if (_alert) {
        _alert.hide();
        _alert = null;
      }

      return;
    }

    component = React.createElement(Alert, _extends({}, props, { message: message }));

    _alert = ReactDOM.render(component, mount("mc-alert-mount"));
    _alert.show();

    if (_tooltip) {
      _tooltip.hide();
    }
  },

  blast: function blast(message, opts) {
    var component = void 0;
    var props = opts || {};

    if (!message) {
      if (_blast) {
        _blast.hide();
        _blast = null;
      }

      return;
    }

    component = React.createElement(Blast, _extends({}, props, { message: message }));

    _blast = ReactDOM.render(component, mount("mc-blast-mount", true));
  },

  // show a component instance in a modal window
  modal: function modal(instance, opts) {
    var component = void 0;
    var props = opts || {};

    if (!instance) {
      if (_modal) {
        _modal.hide();
        _modal = null;
      }

      return;
    }

    component = React.createElement(
      Modal,
      props,
      instance
    );

    _modal = ReactDOM.render(component, mount("mc-modal-mount"));
    _modal.show();

    if (_tooltip) {
      _tooltip.hide();
    }
  },

  fatal: function fatal(message) {
    ReactDOM.render(React.createElement(ErrorView, { message: message }), document.getElementById("mc-content"));
  },

  legal: function legal(path) {
    ui.modal(React.createElement(LegalView, { path: path || "./legal/index.html" }));
  },

  help: function help(path) {
    ui.modal(React.createElement(HelpView, { path: path }), { width: "400px" });
  },

  stat: function stat() {
    mc.ajax.get("/status").then(function (response) {
      var stat = mc.ajax.parse(response);

      mc.ui.alert("API version " + stat.version + " (" + stat.build + ")");
    }).catch(function (err) {
      mc.ui.alert("The API is unavailable.", { level: "error" });
    });
  },

  freeze: function freeze(f) {
    document.body.style.overflow = f ? "hidden" : "scroll";
  },

  wait: wait,

  keyboard: keyboard,

  colors: colors
});

window.addEventListener("hashchange", function () {
  ui.modal(null);
  ui.alert(null);

  if (ui.tooltip) {
    ui.tooltip.hide();
    ui.emit("view");
  }
});

window.addEventListener("resize", function () {
  clearTimeout(ui._timeout);

  ui._timeout = setTimeout(function () {
    ui.emit("resize", window.innerWidth, window.innerHeight);
  }, 350);
});

window.addEventListener("DOMContentLoaded", function () {
  _tooltip = ReactDOM.render(React.createElement(Tooltip, null), mount("mc-tooltip-mount"));

  // show or hide the tooltip
  ui.tooltip = {
    show: _tooltip.show,
    hide: _tooltip.hide
  };

  ui.emit("view");
});

document.addEventListener("visibilitychange", function () {
  if (document.hidden) {
    ui.emit("exit");
  } else {
    ui.emit("enter");
    ui.emit("view");
  }
});

module.exports = ui;

});

require.register("hec-biostamp-core/js/mc-widgets.js", function(exports, require, module) {
"use strict";

var widgets = {
  Blip: require("./widget/Blip"),
  Calendar: require("./widget/Calendar"),
  Check: require("./widget/Check"),
  DatePicker: require("./widget/DatePicker"),
  Drop: require("./widget/Drop"),
  FormControls: require("./widget/FormControls"),
  FormDate: require("./widget/FormDate"),
  FormFeedback: require("./widget/FormFeedback"),
  FormRange: require("./widget/FormRange"),
  IconButton: require("./widget/IconButton"),
  Meter: require("./widget/Meter"),
  Orderable: require("./widget/Orderable"),
  Pulse: require("./widget/Pulse"),
  QuickSearch: require("./widget/QuickSearch"),
  Slider: require("./widget/Slider"),
  Tabs: require("./widget/Tabs"),
  Table: require("./widget/Table"),
  Toggle: require("./widget/Toggle")
};

module.exports = widgets;

});

require.register("hec-biostamp-core/js/mc.js", function(exports, require, module) {
"use strict";

var Cache = require("./lib/Cache");
var Bundle = require("./lib/Bundle");
var Router = require("./lib/Router");
var Auth = require("./lib/Auth");
var Loader = require("./lib/Loader");
var Logger = require("./lib/Logger");
var PromiseLib = require("./lib/es6-promise");
var State = require("./lib/State");
var Server = require("./lib/Server");

var mc = {};
mc.Emitter = require("./lib/Emitter");
mc.ajax = require("./lib/Ajax");
mc.format = require("./lib/Format");
mc.file = require("./lib/File");
mc.math = require("./lib/Math");
mc.utils = require("./lib/Utils");
mc.state = require("./lib/State");
mc.tz = require("./lib/TimeZone");
mc.server = new Server(location.hostname, (location.search.match(/env=(test|int|qa|prod)/) || [])[1]);
mc.cache = new Cache();
mc.bundle = new Bundle();
mc.router = new Router();
mc.auth = new Auth();
mc.loader = new Loader();
mc.logger = Logger.getContext("mc");
mc.ui = require("./mc-ui");
mc.widgets = require("./mc-widgets");
mc.charts = require("./mc-charts");
mc.plot = require("./mc-plot");

if (!Array.prototype.find) {
  Array.prototype.find = function (predicate, thisArg) {
    var list = Object(this);
    var length = list.length >>> 0;
    var value = void 0;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }

    return undefined;
  };
}

if (!Array.prototype.findIndex) {
  Array.prototype.findIndex = function (predicate, thisArg) {
    var list = Object(this);
    var length = list.length >>> 0;
    var value = void 0;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return i;
      }
    }

    return -1;
  };
}

if (!Array.prototype.includes) {
  Array.prototype.includes = function (item, fromIndex) {
    return this.indexOf(item, fromIndex) > -1;
  };
}

if (!Array.prototype.fill) {
  Array.prototype.fill = function (value, start, end) {
    var O = Object(this);
    var len = O.length >>> 0;
    var relativeStart = start >> 0;
    var k = relativeStart < 0 ? Math.max(len + relativeStart, 0) : Math.min(relativeStart, len);
    var relativeEnd = end === undefined ? len : end >> 0;
    var _final = relativeEnd < 0 ? Math.max(len + relativeEnd, 0) : Math.min(relativeEnd, len);

    while (k < _final) {
      O[k] = value;
      k++;
    }

    return O;
  };
}

if (!Object.values) {
  Object.values = function (obj) {
    return Object.keys(obj).map(function (key) {
      return obj[key];
    });
  };
}

// display environment flag if not in production mode
if (mc.server.ENV !== "prod") {
  var elem = document.getElementById("mc-env");

  if (elem) {
    elem.textContent = mc.server.ENV;
    elem.style.visibility = "visible";
  }
}

// default behavior for intercepting route change
mc.router.setPrompt(function () {
  return new Promise(function (resolve, reject) {
    mc.ui.alert(tx("cancel_editing"), {
      mode: "confirm",
      labels: {
        cancel: tx("keep_editing"),
        confirm: tx("discard_changes")
      },
      onHide: function onHide(confirmed) {
        if (confirmed) {
          resolve();
        } else {
          reject();
        }
      }
    });
  });
});

// default "page not found" behavior
mc.router.setFallback(mc.ui.fatal);

// default strings used in core package, can be overwritten
mc.bundle.addMessages({
  "loading": "Loading ...",
  "save": "Save",
  "cancel": "Cancel",
  "delete": "Delete",
  "okay": "Okay",
  "oops": "Oops!",
  "cancel_editing": "Wait! You have unsaved changes.",
  "keep_editing": "Keep Editing",
  "discard_changes": "Discard Changes"
});

window.Promise = window.Promise || PromiseLib.Promise;
window.tx = mc.bundle.translate.bind(mc.bundle);
window.mc = mc;

module.exports = mc;

});

require.register("hec-biostamp-core/js/plot/Plot.js", function(exports, require, module) {
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _Math = require("../lib/Math");
var Utils = require("../lib/Utils");

var Plot = function (_React$Component) {
  _inherits(Plot, _React$Component);

  function Plot() {
    _classCallCheck(this, Plot);

    return _possibleConstructorReturn(this, (Plot.__proto__ || Object.getPrototypeOf(Plot)).apply(this, arguments));
  }

  _createClass(Plot, [{
    key: "scaleX",
    value: function scaleX(domainX, typeX, insetX, width, margin) {
      var scale = d3.scaleLinear;
      var x0 = insetX;
      var x1 = width - margin.left - margin.right - insetX;
      var range = [x0, x1];

      if (typeX === "UTC") {
        scale = d3.scaleUtc;
      }

      if (typeX === "ordinal") {
        var step = (x1 - x0) / domainX.length;

        range = domainX.map(function (d, i) {
          return x0 + step / 2 + step * i;
        });
        scale = d3.scaleOrdinal;
      }

      return scale().domain(domainX).range(range);
    }
  }, {
    key: "scaleY",
    value: function scaleY(domainY, typeY, insetY, height, margin) {
      var scale = d3.scaleLinear;
      var y0 = height - margin.top - margin.bottom;
      var y1 = margin.top;
      var range = [y0, y1];

      if (typeY === "ordinal") {
        var step = (y0 - y1) / domainY.length;

        range = domainY.map(function (d, i) {
          return y1 + step / 2 + step * i;
        });
        scale = d3.scaleOrdinal;
      }

      return scale().domain(domainY).range(range);
    }
  }, {
    key: "inferDomain",
    value: function inferDomain(data, domain, type, step, accessor, zeroFloor) {
      if (type === "ordinal") {
        return domain || Utils.distinct(data.map(accessor));
      }

      var _ref = domain || (zeroFloor ? [0, d3.max(data, accessor)] : d3.extent(data, accessor)),
          _ref2 = _slicedToArray(_ref, 2),
          a = _ref2[0],
          b = _ref2[1];

      var steps = [[0.1, 0.2, 0.5], [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000]];

      var ticks = _Math.ticks(a || 0, b || 1, step || (b - a <= 1 ? steps[0] : steps[1]), 10);

      var extent = d3.extent(ticks);

      if (type === "linear") {
        extent.ticks = ticks;
      }

      return extent;
    }
  }, {
    key: "render",
    value: function render() {
      var _props = this.props,
          children = _props.children,
          id = _props.id,
          width = _props.width,
          height = _props.height,
          margin = _props.margin,
          background = _props.background,
          data = _props.data,
          domainX = _props.domainX,
          domainY = _props.domainY,
          getX = _props.getX,
          getY = _props.getY,
          formatX = _props.formatX,
          formatY = _props.formatY,
          typeX = _props.typeX,
          typeY = _props.typeY,
          stepX = _props.stepX,
          stepY = _props.stepY,
          insetX = _props.insetX;


      var x = margin.left;
      var y = margin.top;
      var w = width - margin.left - margin.right;
      var h = height - margin.top - margin.bottom;

      var _domainX = this.inferDomain(data, domainX, typeX, stepX, getX, false);
      var _domainY = this.inferDomain(data, domainY, typeY, stepY, getY, true);
      var scaleX = this.scaleX(_domainX, typeX, insetX, width, margin);
      var scaleY = this.scaleY(_domainY, typeY, null, height, margin);

      return React.createElement(
        "svg",
        { width: width, height: height, className: "mc-plot", id: id },
        React.createElement(
          "g",
          { transform: "translate(" + x + "," + y + ")" },
          React.createElement("rect", { width: w, height: h, fill: background }),
          React.Children.map(children, function (child, i) {
            if (child.props.visible === false) {
              return null;
            }

            var _getY = child.props.getY || getY;

            var isDefined = function isDefined(d) {
              var y = _getY(d);

              return y !== null && y !== undefined;
            };

            var elem = React.cloneElement(child, {
              data: child.props.filter === false ? data : data.filter(isDefined),
              width: w,
              height: h,
              margin: margin,
              scaleX: scaleX,
              scaleY: scaleY,
              getX: getX,
              getY: _getY,
              formatX: formatX,
              formatY: formatY,
              domainX: _domainX,
              domainY: _domainY,
              typeX: typeX,
              typeY: typeY,
              stepY: stepY,
              insetX: Math.max(5, insetX)
            });

            return elem;
          })
        )
      );
    }
  }]);

  return Plot;
}(React.Component);

Plot.defaultProps = {
  id: null,
  width: 800,
  height: 300,
  margin: { top: 10, right: 10, bottom: 50, left: 60 },
  background: "#fff",
  data: [],
  domainX: null,
  domainY: null,
  insetX: 10,
  getX: function getX(x, i) {
    return i;
  },
  getY: function getY(y) {
    return y;
  },
  formatX: null,
  formatY: null,
  typeX: "linear",
  typeY: "linear",
  stepX: null,
  stepY: null
};

module.exports = Plot;

});

require.register("hec-biostamp-core/js/plot/PlotArea.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PlotArea = function (_React$Component) {
  _inherits(PlotArea, _React$Component);

  function PlotArea() {
    _classCallCheck(this, PlotArea);

    return _possibleConstructorReturn(this, (PlotArea.__proto__ || Object.getPrototypeOf(PlotArea)).apply(this, arguments));
  }

  _createClass(PlotArea, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.plot();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      this.plot();
    }
  }, {
    key: "plot",
    value: function plot() {
      var _props = this.props,
          data = _props.data,
          scaleX = _props.scaleX,
          scaleY = _props.scaleY,
          getX = _props.getX,
          getY = _props.getY,
          color = _props.color,
          opacity = _props.opacity,
          shape = _props.shape;


      var pairY = function pairY(d) {
        return [0].concat(getY(d)).slice(-2);
      };

      var areaGenerator = d3.area().defined(function (d) {
        return d !== undefined;
      }).x(function (d, i) {
        return scaleX(getX(d, i));
      }).y0(function (d) {
        return scaleY(pairY(d)[0]);
      }).y1(function (d) {
        return scaleY(pairY(d)[1]);
      });

      if (shape === "curve") {
        areaGenerator.curve(d3.curveCardinal);
      }

      d3.select(this.refs.area).datum(data).attr("d", areaGenerator).attr("fill", color).attr("fill-opacity", opacity);
    }
  }, {
    key: "render",
    value: function render() {
      return React.createElement(
        "g",
        { className: "mc-plot-area" },
        React.createElement("path", { ref: "area" })
      );
    }
  }]);

  return PlotArea;
}(React.Component);

PlotArea.defaultProps = {
  color: "#304561",
  opacity: 1,
  shape: "straight" // "curve"
};

module.exports = PlotArea;

});

require.register("hec-biostamp-core/js/plot/PlotBars.js", function(exports, require, module) {
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _Math = require("../lib/Math");

var PlotBars = function (_React$Component) {
  _inherits(PlotBars, _React$Component);

  function PlotBars() {
    _classCallCheck(this, PlotBars);

    return _possibleConstructorReturn(this, (PlotBars.__proto__ || Object.getPrototypeOf(PlotBars)).apply(this, arguments));
  }

  _createClass(PlotBars, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.plot();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      this.plot();
    }
  }, {
    key: "plot",
    value: function plot() {
      var _props = this.props,
          data = _props.data,
          scaleX = _props.scaleX,
          scaleY = _props.scaleY,
          getX = _props.getX,
          getY = _props.getY,
          typeX = _props.typeX,
          domainX = _props.domainX,
          formatY = _props.formatY,
          width = _props.width,
          height = _props.height,
          color = _props.color,
          opacity = _props.opacity,
          align = _props.align,
          series = _props.series;

      var _series = _slicedToArray(series, 2),
          idx = _series[0],
          len = _series[1];

      var w = void 0;
      var x = void 0;
      var m = void 0;

      if (typeX === "ordinal") {
        w = width / (domainX.length + 1);
      } else if (align === "left") {
        w = scaleX(data[0].x1) - scaleX(data[0].x0) - 1;
      } else {
        x = data.map(getX);
        m = _Math.min(x.map(function (n, i) {
          return n - x[i - 1];
        }).filter(function (n) {
          return n > 0;
        }));
        w = Math.min(25, scaleX(m * 2) - scaleX(m));
      }

      var bars = d3.select(this.refs.bars).selectAll("rect").data(data);

      var pairY = function pairY(d) {
        return [0].concat(getY(d)).slice(-2);
      };

      var diffY = function diffY(d) {
        return d[1] - d[0];
      };

      var fmt = formatY || function (y) {
        return y;
      };

      bars.enter().append("rect").merge(bars).attr("x", function (d, i) {
        return scaleX(getX(d, i)) + (align === "left" ? 2 : w / -2) + w * idx / len;
      }).attr("y", function (d) {
        return scaleY(pairY(d)[1]);
      }).attr("width", w / (len * 1.05)).attr("height", function (d) {
        return height - scaleY(diffY(pairY(d)));
      }).attr("fill", color).attr("fill-opacity", opacity).attr("data-x", getX).attr("data-y", pairY).attr("data-tooltip", function (d) {
        return fmt(diffY(pairY(d)));
      });

      bars.exit().remove();
    }
  }, {
    key: "render",
    value: function render() {
      return React.createElement("g", { className: "mc-plot-bars", ref: "bars" });
    }
  }]);

  return PlotBars;
}(React.Component);

PlotBars.defaultProps = {
  color: "#304561",
  opacity: 1,
  align: "center",
  series: [0, 1]
};

module.exports = PlotBars;

});

require.register("hec-biostamp-core/js/plot/PlotCSVDownload.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var File = require("../lib/File");

var PlotCSVDownload = function (_React$Component) {
  _inherits(PlotCSVDownload, _React$Component);

  function PlotCSVDownload() {
    _classCallCheck(this, PlotCSVDownload);

    return _possibleConstructorReturn(this, (PlotCSVDownload.__proto__ || Object.getPrototypeOf(PlotCSVDownload)).apply(this, arguments));
  }

  _createClass(PlotCSVDownload, [{
    key: "download",
    value: function download() {
      var _props = this.props,
          data = _props.data,
          getX = _props.getX,
          getY = _props.getY,
          labelX = _props.labelX,
          labelY = _props.labelY,
          formatX = _props.formatX,
          useXFormat = _props.useXFormat;


      var row = function row(d, i) {
        var x = getX(d, i);
        var y = getY(d);

        if (useXFormat) {
          x = formatX(x, i);
        } else if (x.toJSON) {
          x = x.toJSON();
        }

        return [x, y].join(",");
      };

      var text = [labelX + "," + labelY].concat(data.map(row)).join("\n");

      File.download("data.csv", "text/csv", text);
    }
  }, {
    key: "render",
    value: function render() {
      var width = this.props.width;


      return React.createElement("image", {
        className: "mc-plot-download",
        x: width - 20,
        y: "3",
        width: "16",
        height: "16",
        xlinkHref: "./img/mc/chart.download.svg",
        onClick: this.download.bind(this),
        "data-tooltip": "CSV" });
    }
  }]);

  return PlotCSVDownload;
}(React.Component);

;

PlotCSVDownload.defaultProps = {
  labelX: "x",
  labelY: "y",
  useXFormat: false
};

module.exports = PlotCSVDownload;

});

require.register("hec-biostamp-core/js/plot/PlotLine.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PlotLine = function (_React$Component) {
  _inherits(PlotLine, _React$Component);

  function PlotLine() {
    _classCallCheck(this, PlotLine);

    return _possibleConstructorReturn(this, (PlotLine.__proto__ || Object.getPrototypeOf(PlotLine)).apply(this, arguments));
  }

  _createClass(PlotLine, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.plot();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      this.plot();
    }
  }, {
    key: "plot",
    value: function plot() {
      var _props = this.props,
          data = _props.data,
          scaleX = _props.scaleX,
          scaleY = _props.scaleY,
          getX = _props.getX,
          getY = _props.getY,
          color = _props.color,
          stroke = _props.stroke,
          shape = _props.shape,
          dot = _props.dot,
          dash = _props.dash;


      var plotX = function plotX(d, i) {
        return scaleX(getX(d, i));
      };
      var plotY = function plotY(d) {
        return scaleY(getY(d));
      };

      var lineGenerator = d3.line().x(plotX).y(plotY).defined(function (d) {
        return !isNaN(getY(d));
      });

      if (shape === "curve") {
        lineGenerator.curve(d3.curveCardinal);
      }

      d3.select(this.refs.line).datum(data).attr("d", lineGenerator).attr("stroke-width", stroke).attr("stroke-dasharray", dash).attr("stroke", color);

      if (dot) {
        var dots = d3.select(this.refs.dots).selectAll("circle").data(data);

        dots.exit().remove();

        dots = dots.enter().append("circle").merge(dots).attr("cx", plotX).attr("cy", plotY).attr("data-x", getX).attr("data-y", getY);

        if (dot === "closed") {
          dots.attr("r", stroke + 2).attr("fill", color);
        }

        if (dot === "open") {
          dots.attr("r", stroke + 3).attr("stroke", color).attr("stroke-width", stroke).attr("fill", "white");
        }
      }
    }
  }, {
    key: "render",
    value: function render() {
      var opacity = this.props.opacity;


      return React.createElement(
        "g",
        { className: "mc-plot-line", style: { opacity: opacity } },
        React.createElement("path", { ref: "line" }),
        React.createElement("g", { ref: "dots" })
      );
    }
  }]);

  return PlotLine;
}(React.Component);

PlotLine.defaultProps = {
  color: "#304561",
  stroke: 1,
  opacity: 1,
  shape: "straight", // "curve"
  dot: "closed", // "open", null
  dash: null // "4 4"
};

module.exports = PlotLine;

});

require.register("hec-biostamp-core/js/plot/PlotRasterLine.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PlotRasterLine = function (_React$Component) {
  _inherits(PlotRasterLine, _React$Component);

  function PlotRasterLine() {
    _classCallCheck(this, PlotRasterLine);

    return _possibleConstructorReturn(this, (PlotRasterLine.__proto__ || Object.getPrototypeOf(PlotRasterLine)).apply(this, arguments));
  }

  _createClass(PlotRasterLine, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.plot();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      this.plot();
    }
  }, {
    key: "plot",
    value: function plot() {
      var _props = this.props,
          data = _props.data,
          getX = _props.getX,
          getY = _props.getY,
          scaleX = _props.scaleX,
          scaleY = _props.scaleY,
          color = _props.color;


      var canvas = this.refs.canvas;
      canvas.width = canvas.width;

      var ctx = canvas.getContext("2d");

      var i = 0;
      var len = data.length;

      var x = function x(i) {
        return scaleX(getX(data[i], i)) * 2;
      };
      var y = function y(i) {
        return scaleY(getY(data[i])) * 2;
      };

      if (len) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.moveTo(x(0), y(0));

        for (i = 1; i < len; i++) {
          ctx.lineTo(x(i), y(i));
        }

        ctx.stroke();
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _props2 = this.props,
          width = _props2.width,
          height = _props2.height;


      return React.createElement(
        "foreignObject",
        { className: "mc-plot-raster-line", width: width, height: height },
        React.createElement("canvas", { ref: "canvas", width: width * 2, height: height * 2, style: { width: width, height: height } })
      );
    }
  }]);

  return PlotRasterLine;
}(React.Component);

PlotRasterLine.defaultProps = {
  color: "#304561"
};

module.exports = PlotRasterLine;

});

require.register("hec-biostamp-core/js/plot/PlotRasterScatter.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PlotScatter = function (_React$Component) {
  _inherits(PlotScatter, _React$Component);

  function PlotScatter() {
    _classCallCheck(this, PlotScatter);

    return _possibleConstructorReturn(this, (PlotScatter.__proto__ || Object.getPrototypeOf(PlotScatter)).apply(this, arguments));
  }

  _createClass(PlotScatter, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.plot();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      this.plot();
    }
  }, {
    key: "plot",
    value: function plot() {
      var _props = this.props,
          data = _props.data,
          scaleX = _props.scaleX,
          scaleY = _props.scaleY,
          getX = _props.getX,
          getY = _props.getY,
          color = _props.color,
          size = _props.size;


      var canvas = this.refs.canvas;
      canvas.width = canvas.width;

      var ctx = canvas.getContext("2d");

      ctx.fillStyle = color;
      ctx.beginPath();

      data.forEach(function (d, i) {
        var x = scaleX(getX(d, i)) * 2;
        var y = scaleY(getY(d)) * 2;
        var r = size;

        ctx.moveTo(x, y);
        ctx.arc(x, y, r, 0, Math.PI * 2);
      });

      ctx.fill();
    }
  }, {
    key: "render",
    value: function render() {
      var _props2 = this.props,
          width = _props2.width,
          height = _props2.height;


      return React.createElement(
        "foreignObject",
        { className: "mc-plot-raster-scatter", width: width, height: height },
        React.createElement("canvas", { ref: "canvas", width: width * 2, height: height * 2, style: { width: width, height: height } })
      );
    }
  }]);

  return PlotScatter;
}(React.Component);

PlotScatter.defaultProps = {
  size: 6,
  color: "#304561"
};

module.exports = PlotScatter;

});

require.register("hec-biostamp-core/js/plot/PlotScatter.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PlotScatter = function (_React$Component) {
  _inherits(PlotScatter, _React$Component);

  function PlotScatter() {
    _classCallCheck(this, PlotScatter);

    return _possibleConstructorReturn(this, (PlotScatter.__proto__ || Object.getPrototypeOf(PlotScatter)).apply(this, arguments));
  }

  _createClass(PlotScatter, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.plot();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      this.plot();
    }
  }, {
    key: "plot",
    value: function plot() {
      var _props = this.props,
          data = _props.data,
          scaleX = _props.scaleX,
          scaleY = _props.scaleY,
          getX = _props.getX,
          getY = _props.getY,
          getZ = _props.getZ,
          color = _props.color,
          stroke = _props.stroke,
          opacity = _props.opacity,
          image = _props.image,
          size = _props.size;


      var points = d3.select(this.refs.points);
      var disciminator = function disciminator(d, i) {
        return [getX(d, i), getY(d)].toString();
      };

      if (image) {
        points = points.selectAll("image").data(data, disciminator);

        points.exit().remove();

        points = points.enter().append("image").merge(points).attr("xlink:href", image).attr("x", function (d, i) {
          return scaleX(getX(d, i));
        }).attr("y", function (d) {
          return scaleY(getY(d));
        }).attr("transform", "translate(" + size / -2 + "," + size / -2 + ")").attr("width", size).attr("height", size).attr("opacity", opacity);
      } else {
        points = points.selectAll("circle").data(data, disciminator);

        points.exit().remove();

        points = points.enter().append("circle").merge(points).attr("cx", function (d, i) {
          return scaleX(getX(d, i));
        }).attr("cy", function (d) {
          return scaleY(getY(d));
        }).attr("r", function (d) {
          return size / 2 * (getZ ? Math.sqrt(getZ(d)) : 1);
        }).attr("data-x", function (d, i) {
          return getX(d, i);
        }).attr("data-y", getY).attr("data-z", getZ).attr("data-tooltip", getZ).attr("fill", color).attr("stroke", stroke ? color : null).attr("stroke-width", stroke).attr("fill-opacity", opacity);
      }

      points.attr("data-x", getX).attr("data-y", getY);
    }
  }, {
    key: "render",
    value: function render() {
      return React.createElement("g", { className: "mc-plot-scatter", ref: "points" });
    }
  }]);

  return PlotScatter;
}(React.Component);

PlotScatter.defaultProps = {
  size: 6,
  color: "#304561",
  opacity: 1,
  stroke: null,
  image: null,
  getZ: null
};

module.exports = PlotScatter;

});

require.register("hec-biostamp-core/js/plot/PlotTransforms.js", function(exports, require, module) {
"use strict";

var _Math = require("../lib/Math");

var histogram = function histogram(data, getY) {
  var extent = data.length ? d3.extent(data, getY) : [0, 1];
  var bins = d3.histogram().domain(extent)(data.map(getY));
  var step = d3.max(bins, function (bin) {
    return bin.x1 - bin.x0;
  }) || 1;
  var n = bins.length - 1;
  var a = _Math.round(bins[0].x0, -step);
  var b = _Math.round(bins[n].x1, step);
  var s = step || 1;

  if (a === b) {
    a--;
    b++;
  }

  bins[0].x0 = a;
  bins[n].x1 = b;

  return {
    data: bins,
    domainX: b ? [a, b] : [0, 1],
    domainY: [0, d3.max(bins, function (bin) {
      return bin.length;
    }) || 1],
    stepX: [s, s * 2, s * 4],
    getX: function getX(bin) {
      return bin.x0;
    },
    getY: function getY(bin) {
      return bin.length;
    }
  };
};

var trend = function trend(data, getX, getY) {
  var _data = data.filter(function (d) {
    var y = getY(d);
    return y !== null && y !== undefined && !isNaN(y);
  });

  var points = _data.map(function (d, i) {
    return [getX(d, i), getY(d)];
  });
  var trend = _Math.trend(points);

  return function (d) {
    return trend(getX(d));
  };
};

var frequency = function frequency(data, getX, getY) {
  var results = [];

  data.forEach(function (d, i) {
    var x = getX(d, i);
    var y = getY(d);

    var found = results.find(function (a) {
      return a.x === x && a.y === y;
    });

    if (found) {
      found.z++;
    } else {
      results.push({ x: x, y: y, z: 1 });
    }
  });

  return {
    data: results,
    getX: function getX(d) {
      return d.x;
    },
    getY: function getY(d) {
      return d.y;
    },
    getZ: function getZ(d) {
      return d.z;
    }
  };
};

var stack = function stack(data, getX, getY) {
  var results = data.map(function (d, i) {
    var y = getY(d);

    return {
      x: getX(d, i),
      y: [0].concat(y.map(function (n, i) {
        return d3.sum(y.slice(0, i)) + n;
      }))
    };
  });

  return {
    data: results,
    getX: function getX(d, i) {
      return d.x;
    },
    getY: data.map(function (d, i) {
      return function (d) {
        return d.y.slice(i, i + 2);
      };
    }),
    domainY: [0, d3.max(results, function (d) {
      return d3.max(d.y);
    })]
  };
};

module.exports = { histogram: histogram, trend: trend, frequency: frequency, stack: stack };

});

require.register("hec-biostamp-core/js/plot/PlotXAxis.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _Math = require("../lib/Math");

var PlotXAxis = function (_React$Component) {
  _inherits(PlotXAxis, _React$Component);

  function PlotXAxis() {
    _classCallCheck(this, PlotXAxis);

    return _possibleConstructorReturn(this, (PlotXAxis.__proto__ || Object.getPrototypeOf(PlotXAxis)).apply(this, arguments));
  }

  _createClass(PlotXAxis, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.plot();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      this.plot();
    }
  }, {
    key: "plot",
    value: function plot() {
      var _props = this.props,
          scaleX = _props.scaleX,
          domainX = _props.domainX,
          formatX = _props.formatX,
          height = _props.height;


      var xNode = d3.select(this.refs.axis);

      var xAxis = d3.axisBottom().scale(scaleX).tickSizeInner(height + 5).tickValues(domainX.ticks) // may be null
      .tickFormat(formatX); // may be null

      xNode.call(xAxis);
    }
  }, {
    key: "render",
    value: function render() {
      var _props2 = this.props,
          width = _props2.width,
          height = _props2.height,
          margin = _props2.margin,
          label = _props2.label;


      return React.createElement(
        "g",
        { className: "mc-plot-x-axis" },
        React.createElement(
          "text",
          { x: width / 2, y: height + margin.bottom - 5 },
          label
        ),
        React.createElement("g", { ref: "axis" })
      );
    }
  }]);

  return PlotXAxis;
}(React.Component);

var PlotXAxisNav = function (_React$Component2) {
  _inherits(PlotXAxisNav, _React$Component2);

  function PlotXAxisNav() {
    _classCallCheck(this, PlotXAxisNav);

    return _possibleConstructorReturn(this, (PlotXAxisNav.__proto__ || Object.getPrototypeOf(PlotXAxisNav)).apply(this, arguments));
  }

  _createClass(PlotXAxisNav, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.plot();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      this.plot();
    }
  }, {
    key: "plot",
    value: function plot() {
      var _props3 = this.props,
          scaleX = _props3.scaleX,
          formatX = _props3.formatX,
          getX = _props3.getX,
          data = _props3.data,
          onClick = _props3.onClick;


      var hitNode = d3.select(this.refs.hit);
      var crossNode = d3.select(this.refs.cross);
      var textNode = d3.select(this.refs.text);

      var targetX = function targetX() {
        var point = d3.mouse(hitNode.node());
        var x = scaleX.invert(point[0]);
        var datum = _Math.nearest(data, x, null, getX);

        return getX(datum) || Math.round(x);
      };

      if (data.length) {
        hitNode.on("mousemove", function () {
          var x = targetX();

          crossNode.attr("transform", "translate(" + scaleX(x) + ")").style("visibility", "visible");

          textNode.text(formatX(x));
        }).on("click", function () {
          var x = targetX();

          onClick(x);
        }).on("mouseout", function () {
          crossNode.style("visibility", "hidden");
        });
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _props4 = this.props,
          width = _props4.width,
          height = _props4.height;


      return React.createElement(
        "g",
        { className: "mc-plot-x-axis-nav" },
        React.createElement("rect", { width: width, height: height, fillOpacity: 0, ref: "hit" }),
        React.createElement(
          "g",
          { ref: "cross" },
          React.createElement("line", { y1: 0, y2: height + 3, stroke: "black" }),
          React.createElement(
            "g",
            { transform: "translate(-20," + (height + 3) + ")" },
            React.createElement("rect", { width: "40", height: "20", rx: "10", ry: "10" }),
            React.createElement("text", { width: "40", x: "20", y: "14", ref: "text" })
          )
        )
      );
    }
  }]);

  return PlotXAxisNav;
}(React.Component);

PlotXAxis.Nav = PlotXAxisNav;

module.exports = PlotXAxis;

});

require.register("hec-biostamp-core/js/plot/PlotYAxis.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _Math = require("../lib/Math");

var PlotYAxis = function (_React$Component) {
  _inherits(PlotYAxis, _React$Component);

  function PlotYAxis() {
    _classCallCheck(this, PlotYAxis);

    return _possibleConstructorReturn(this, (PlotYAxis.__proto__ || Object.getPrototypeOf(PlotYAxis)).apply(this, arguments));
  }

  _createClass(PlotYAxis, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.plot();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      this.plot();
    }
  }, {
    key: "plot",
    value: function plot() {
      var _props = this.props,
          scaleY = _props.scaleY,
          formatY = _props.formatY,
          domainY = _props.domainY,
          typeY = _props.typeY,
          width = _props.width;


      var yNode = d3.select(this.refs.axis);

      var yAxis = d3.axisLeft().scale(scaleY).tickSizeInner(width).tickFormat(formatY); // may be null

      if (typeY === "ordinal") {
        yAxis.tickValues(domainY);
      } else {
        yAxis.tickValues(domainY.ticks); // may be null
      }

      yNode.call(yAxis);
    }
  }, {
    key: "render",
    value: function render() {
      var _props2 = this.props,
          width = _props2.width,
          height = _props2.height,
          margin = _props2.margin,
          label = _props2.label;


      return React.createElement(
        "g",
        { className: "mc-plot-y-axis" },
        React.createElement(
          "text",
          { x: height / -2, y: 10 - margin.left, transform: "rotate(-90)", textAnchor: "middle" },
          label
        ),
        React.createElement("g", { transform: "translate(" + width + ")", ref: "axis" })
      );
    }
  }]);

  return PlotYAxis;
}(React.Component);

module.exports = PlotYAxis;

});

require.register("hec-biostamp-core/js/view/ErrorView.js", function(exports, require, module) {
"use strict";

var ErrorView = function ErrorView(props) {
  var message = props.message || "Oh no! Something went wrong.";

  return React.createElement(
    "div",
    { className: "mc-error-view" },
    React.createElement("img", { src: "./img/mc/crash.svg", width: "100", height: "90" }),
    React.createElement(
      "h1",
      null,
      message
    )
  );
};

module.exports = ErrorView;

});

require.register("hec-biostamp-core/js/view/HelpView.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Ajax = require("../lib/Ajax");

var HelpView = function (_React$Component) {
  _inherits(HelpView, _React$Component);

  function HelpView(props) {
    _classCallCheck(this, HelpView);

    var _this = _possibleConstructorReturn(this, (HelpView.__proto__ || Object.getPrototypeOf(HelpView)).call(this, props));

    _this.state = {
      content: null
    };
    return _this;
  }

  _createClass(HelpView, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var path = this.props.path;

      Ajax.get(path).then(function (response) {
        this.setState({ content: response });
      }.bind(this));
    }
  }, {
    key: "render",
    value: function render() {
      var content = this.state.content;

      var markup = function markup() {
        return { __html: content };
      };

      return React.createElement(
        "div",
        { className: "mc-help-view" },
        React.createElement(
          "header",
          null,
          React.createElement("img", { src: "./img/mc/help.svg", width: "70", height: "70" })
        ),
        React.createElement("div", { dangerouslySetInnerHTML: markup() })
      );
    }
  }]);

  return HelpView;
}(React.Component);

module.exports = HelpView;

});

require.register("hec-biostamp-core/js/view/LegalView.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Ajax = require("../lib/Ajax");

var LegalView = function (_React$Component) {
  _inherits(LegalView, _React$Component);

  function LegalView(props) {
    _classCallCheck(this, LegalView);

    var _this = _possibleConstructorReturn(this, (LegalView.__proto__ || Object.getPrototypeOf(LegalView)).call(this, props));

    _this.state = {
      content: null
    };
    return _this;
  }

  _createClass(LegalView, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var path = this.props.path;

      Ajax.get(path).then(function (response) {
        this.setState({ content: response });
      }.bind(this));
    }
  }, {
    key: "render",
    value: function render() {
      var content = this.state.content;

      var markup = function markup() {
        return { __html: content };
      };

      return React.createElement(
        "div",
        { className: "mc-legal-view" },
        React.createElement(
          "header",
          null,
          React.createElement("img", { src: "./img/mc/legal.svg", width: "55", height: "55" })
        ),
        React.createElement("div", { dangerouslySetInnerHTML: markup() })
      );
    }
  }]);

  return LegalView;
}(React.Component);

module.exports = LegalView;

});

require.register("hec-biostamp-core/js/widget/Alert.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Dialog = require("./Dialog");

var Alert = function (_Dialog) {
  _inherits(Alert, _Dialog);

  function Alert(props) {
    _classCallCheck(this, Alert);

    var _this = _possibleConstructorReturn(this, (Alert.__proto__ || Object.getPrototypeOf(Alert)).call(this, props));

    _this.state.input = props.input;
    return _this;
  }

  _createClass(Alert, [{
    key: "cancel",
    value: function cancel() {
      this.hide(false);
    }
  }, {
    key: "confirm",
    value: function confirm() {
      this.hide(true, this.state.input);
    }
  }, {
    key: "setInput",
    value: function setInput(evt) {
      this.setState({
        input: evt.target.value
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _props = this.props,
          level = _props.level,
          message = _props.message,
          input = _props.input,
          inputLimit = _props.inputLimit,
          mode = _props.mode,
          labels = _props.labels;


      return React.createElement(
        "div",
        { className: "mc-alert-scrim", tabIndex: "0" },
        React.createElement(
          "div",
          {
            className: "mc-alert-dialog",
            "data-level": level,
            ref: "dialog",
            role: "alertdialog",
            "aria-describedby": "mc-alert-body",
            tabIndex: "-1" },
          React.createElement(
            "div",
            { className: "mc-alert-body" },
            React.createElement(
              "p",
              null,
              message
            ),
            input !== null && (inputLimit <= 64 ? React.createElement("input", {
              type: "text",
              size: "24",
              maxLength: inputLimit,
              value: this.state.input,
              onChange: this.setInput.bind(this) }) : React.createElement("textarea", {
              rows: "6",
              cols: "32",
              maxLength: inputLimit,
              value: this.state.input,
              onChange: this.setInput.bind(this) }))
          ),
          React.createElement(
            "div",
            null,
            mode !== "alert" && React.createElement(
              "button",
              { className: "mc-button mc-alert-cancel", onClick: this.cancel.bind(this) },
              labels.cancel || tx("cancel")
            ),
            React.createElement(
              "button",
              {
                className: "mc-button mc-alert-confirm",
                onClick: this.confirm.bind(this),
                disabled: input !== null && this.state.input.trim() === "" },
              labels.confirm || tx("okay")
            )
          )
        )
      );
    }
  }]);

  return Alert;
}(Dialog);

Alert.defaultProps = {
  level: "info",
  mode: "alert",
  dismissable: true,
  labels: {
    // cancel: "Cancel",
    // confirm: "Okay"
  },
  input: null,
  inputLimit: 64,
  selector: "button, input"
};

module.exports = Alert;

});

require.register("hec-biostamp-core/js/widget/Blast.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CloseButton = require("./CloseButton");

var Blast = function (_React$Component) {
  _inherits(Blast, _React$Component);

  function Blast() {
    _classCallCheck(this, Blast);

    return _possibleConstructorReturn(this, (Blast.__proto__ || Object.getPrototypeOf(Blast)).apply(this, arguments));
  }

  _createClass(Blast, [{
    key: "hide",
    value: function hide(evt) {
      if (this.props.onHide) {
        this.props.onHide();
      }

      ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode(this).parentNode);
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      return React.createElement(
        "div",
        { className: "mc-blast mc-screen", "data-level": this.props.level, "data-follow": !!this.props.onFollow },
        React.createElement(
          "div",
          { className: "mc-blast-body", onClick: this.props.onFollow },
          this.props.message
        ),
        React.createElement(
          "div",
          { className: "mc-blast-close" },
          React.createElement(CloseButton, { color: "#fff", size: 16, onClick: function onClick(e) {
              return _this2.hide(e);
            }, tabIndex: "0" })
        )
      );
    }
  }]);

  return Blast;
}(React.Component);

Blast.defaultProps = {
  level: "info", // "info", "warn" or "error"
  onFollow: null,
  onHide: null
};

module.exports = Blast;

});

require.register("hec-biostamp-core/js/widget/Blip.js", function(exports, require, module) {
"use strict";

var Blip = function Blip(props) {
  var color = props.color,
      label = props.label,
      tooltip = props.tooltip,
      effect = props.effect,
      children = props.children;


  return React.createElement(
    "div",
    { className: "mc-blip", "data-effect": effect },
    React.createElement(
      "svg",
      { width: "15", height: "10", "data-tooltip": tooltip, "aria-label": tooltip },
      React.createElement("rect", { width: "10", height: "10", rx: "5", ry: "5", fill: color })
    ),
    label,
    children
  );
};

module.exports = Blip;

});

require.register("hec-biostamp-core/js/widget/Calendar.js", function(exports, require, module) {
"use strict";

var Utils = require("../lib/Utils");
var TimeZone = require("../lib/TimeZone");
var Format = require("../lib/Format");

var Page = function Page(props) {
  var years = props.years,
      months = props.months,
      tz = props.tz,
      data = props.data,
      selectedTs = props.selectedTs,
      onSelect = props.onSelect,
      width = props.width;

  var blocks = [];
  var daysInMonth = new Date(years, months + 1, 0).getDate();
  var d = 1 - new Date(years, months, 1).getDay();
  var w = width;
  var x = -w;
  var y = -w;
  var tsMap = Utils.hash(data, "ts");
  var gmtTs = void 0;
  var match = undefined;

  for (var i = 0; i < 42; i++) {
    x += w;

    if (i % 7 === 0) {
      x = 0;
      y += w;
    }

    gmtTs = TimeZone.info({ years: years, months: months, date: d }, "GMT", "DAY_START").value;
    match = tsMap[gmtTs];

    blocks.push(React.createElement(
      "g",
      {
        key: i,
        transform: "translate(" + x + "," + y + ")",
        "data-day": d >= 1 && d <= daysInMonth ? d : null,
        "data-ts": match ? match.ts : null,
        "data-selected": gmtTs === selectedTs },
      React.createElement("rect", {
        width: w,
        height: w,
        rx: "2",
        ry: "2",
        "data-tooltip": match ? Format.date(match.ts, "GMT", "long") : null,
        onClick: match ? onSelect.bind(null, match.ts, match.ref) : null }),
      match ? React.createElement("circle", { cx: w / 2, cy: w / 2, r: Math.max(2, w / 2.5 * Math.sqrt(match.value)) }) : null
    ));

    d++;
  }

  return React.createElement(
    "div",
    { className: "mc-calendar-page" },
    React.createElement(
      "div",
      null,
      Format.date(new Date(years, months, 2), tz, "cal")
    ),
    React.createElement(
      "div",
      null,
      "SMTWTFS".split("").map(function (s, i) {
        return React.createElement(
          "span",
          { key: i },
          s
        );
      })
    ),
    React.createElement(
      "svg",
      { width: w * 7, height: w * 6 },
      blocks
    )
  );
};

var Calendar = function Calendar(props) {
  var ts = props.ts,
      tz = props.tz,
      data = props.data,
      onSelect = props.onSelect,
      pages = props.pages,
      _props$width = props.width,
      width = _props$width === undefined ? 175 : _props$width;


  var now = Date.now();
  var n = data.length;
  var a = mc.tz.info(n ? data[0].ts : now, "GMT");
  var b = mc.tz.info(n ? data[n - 1].ts : now, "GMT");
  var p = Math.max(pages || 1, 1 + (12 * b.years + b.months) - (12 * a.years + a.months));

  var pgs = new Array(p).fill(0).map(function (p, i) {
    return React.createElement(Page, {
      key: i,
      years: a.years + Math.floor((a.months + i) / 12),
      months: (a.months + i) % 12,
      data: data,
      tz: tz,
      width: Math.floor(width / 7),
      selectedTs: ts,
      onSelect: onSelect });
  });

  return React.createElement(
    "div",
    { className: "mc-calendar" },
    pgs
  );
};

module.exports = Calendar;

});

require.register("hec-biostamp-core/js/widget/Check.js", function(exports, require, module) {
"use strict";

var Check = function Check(props) {
  var checked = props.checked,
      onCheck = props.onCheck,
      label = props.label,
      _props$size = props.size,
      size = _props$size === undefined ? "big" : _props$size,
      _props$shape = props.shape,
      shape = _props$shape === undefined ? "circle" : _props$shape;


  var onChange = function onChange(evt) {
    onCheck(evt.target.checked);
  };

  return React.createElement(
    "label",
    { className: "mc-check", "data-size": size, "data-shape": shape },
    React.createElement("input", { type: "checkbox", checked: checked, onChange: onChange }),
    React.createElement(
      "span",
      null,
      label
    )
  );
};

module.exports = Check;

});

require.register("hec-biostamp-core/js/widget/CloseButton.js", function(exports, require, module) {
"use strict";

var CloseButton = function CloseButton(props) {
  var _props$size = props.size,
      size = _props$size === undefined ? 16 : _props$size,
      _props$color = props.color,
      color = _props$color === undefined ? "#000" : _props$color,
      _props$enabled = props.enabled,
      enabled = _props$enabled === undefined ? true : _props$enabled,
      onClick = props.onClick;


  return React.createElement(
    "button",
    { disabled: !enabled, tabIndex: "0", className: "mc-icon-button", "aria-label": "Close", onClick: onClick },
    React.createElement(
      "svg",
      { viewBox: "0 0 100 100", width: size, height: size },
      React.createElement("line", {
        stroke: color,
        strokeWidth: "18",
        strokeLinecap: "round",
        strokeMiterlimit: "10",
        x1: "13.8",
        y1: "13.8",
        x2: "86.2",
        y2: "86.2" }),
      React.createElement("line", {
        stroke: color,
        strokeWidth: "18",
        strokeLinecap: "round",
        strokeMiterlimit: "10",
        x1: "13.8",
        y1: "86.2",
        x2: "86.2",
        y2: "13.8" })
    )
  );
};

module.exports = CloseButton;

});

require.register("hec-biostamp-core/js/widget/DatePicker.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Drop = require("./Drop");
var IconButton = require("./IconButton");
var Format = require("../lib/Format");
var Keyboard = require("../lib/Keyboard");

function Page(props) {
  var year = props.year,
      month = props.month,
      selected = props.selected,
      onSelect = props.onSelect;


  var onClick = function onClick(date, evt) {
    onSelect(date);
  };

  var onKeyUp = function onKeyUp(date, evt) {
    if (Keyboard.isEnter(evt)) {
      onSelect(date);
    }
  };

  var date = new Date();
  var today = { year: date.getFullYear(), month: date.getMonth(), day: date.getDate() };
  var daysInMonth = new Date(year, month + 1, 0).getDate();
  var day = 1 - new Date(year, month, 1).getDay();

  var isDayInMonth = function isDayInMonth(i) {
    return i > 0 && i <= daysInMonth ? i : null;
  };

  var equals = function equals(a, b) {
    return a && b && a.year === b.year && a.month === b.month && a.day === b.day;
  };

  var heads = "SMTWTFS".split("").map(function (label, i) {
    return React.createElement(
      "th",
      { key: i },
      label
    );
  });

  var rows = [];

  var cells = function () {
    return heads.map(function () {
      var enabled = isDayInMonth(day);
      var date = { year: year, month: month, day: day };

      return React.createElement(
        "td",
        {
          key: day,
          tabIndex: enabled ? 0 : null,
          "aria-disabled": !enabled,
          "data-today": equals(date, today),
          "data-selected": equals(date, selected),
          onClick: enabled ? onClick.bind(this, date) : null,
          onKeyUp: enabled ? onKeyUp.bind(this, date) : null },
        isDayInMonth(day++)
      );
    }, this);
  }.bind(this);

  for (var i = 0; i < 6; i++) {
    rows.push(React.createElement(
      "tr",
      { key: i },
      cells()
    ));
  }

  return React.createElement(
    "table",
    null,
    React.createElement(
      "thead",
      null,
      React.createElement(
        "tr",
        null,
        heads
      )
    ),
    React.createElement(
      "tbody",
      null,
      rows
    )
  );
}

var Calendar = function (_React$Component) {
  _inherits(Calendar, _React$Component);

  function Calendar(props) {
    _classCallCheck(this, Calendar);

    var _this = _possibleConstructorReturn(this, (Calendar.__proto__ || Object.getPrototypeOf(Calendar)).call(this, props));

    _this.state = {
      page: 0,
      now: new Date()
    };
    return _this;
  }

  _createClass(Calendar, [{
    key: "flip",
    value: function flip(offset) {
      this.setState({
        page: this.state.page + offset
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          pages = _props.pages,
          selected = _props.selected,
          onSelect = _props.onSelect;
      var _state = this.state,
          now = _state.now,
          page = _state.page;


      var y = now.getFullYear();
      var m = now.getMonth() + page;
      var months = [];

      for (var i = 1 - pages; i <= 0; i++) {
        months.push(React.createElement(
          "div",
          { className: "mc-date-picker-page", key: i },
          React.createElement(
            "h4",
            null,
            Format.date(new Date(y, m + i, 1), null, "cal")
          ),
          React.createElement(Page, { year: y, month: m + i, selected: selected, onSelect: onSelect.bind(this) })
        ));
      }

      return React.createElement(
        "div",
        { className: "mc-date-picker" },
        React.createElement(
          "div",
          { className: "mc-date-picker-nav" },
          React.createElement(IconButton, { icon: "back", scale: 0.9, onPress: function onPress() {
              return _this2.flip(-1);
            } }),
          React.createElement(IconButton, { icon: "forward", scale: 0.9, onPress: function onPress() {
              return _this2.flip(1);
            } })
        ),
        React.createElement(
          "div",
          null,
          months
        )
      );
    }
  }]);

  return Calendar;
}(React.Component);

Calendar.defaultProps = {
  pages: 1,
  selected: null,
  onSelect: function onSelect(date) {}
};

var DatePicker = function (_React$Component2) {
  _inherits(DatePicker, _React$Component2);

  function DatePicker() {
    _classCallCheck(this, DatePicker);

    return _possibleConstructorReturn(this, (DatePicker.__proto__ || Object.getPrototypeOf(DatePicker)).apply(this, arguments));
  }

  _createClass(DatePicker, [{
    key: "onSelect",
    value: function onSelect(date) {
      this.props.onSelect(date);

      this.refs.drop.close();
    }
  }, {
    key: "render",
    value: function render() {
      var _props2 = this.props,
          pages = _props2.pages,
          align = _props2.align,
          selected = _props2.selected;


      return React.createElement(
        Drop,
        { ref: "drop", selector: "button, td[aria-disabled=false]", align: align },
        React.createElement(
          "div",
          { className: "mc-drop-handle" },
          Format.date(new Date(selected.year, selected.month, selected.day), null, "short")
        ),
        React.createElement(
          "div",
          { className: "mc-drop-content mc-drop-calendar" },
          React.createElement(Calendar, { pages: pages, align: align, selected: selected, onSelect: this.onSelect.bind(this) })
        )
      );
    }
  }]);

  return DatePicker;
}(React.Component);

var today = new Date();

DatePicker.defaultProps = {
  pages: 1,
  selected: {
    year: today.getFullYear(),
    month: today.getMonth(),
    day: today.getDate()
  },
  onSelect: function onSelect() {},
  align: "left"

};

module.exports = DatePicker;

});

require.register("hec-biostamp-core/js/widget/Dialog.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Keyboard = require("../lib/Keyboard");

var Dialog = function (_React$Component) {
  _inherits(Dialog, _React$Component);

  function Dialog(props) {
    _classCallCheck(this, Dialog);

    var _this = _possibleConstructorReturn(this, (Dialog.__proto__ || Object.getPrototypeOf(Dialog)).call(this, props));

    _this.onKeyDown = _this.onKeyDown.bind(_this);
    _this.onKeyUp = _this.onKeyUp.bind(_this);

    _this.state = {
      index: -1,
      mounted: false
    };
    return _this;
  }

  _createClass(Dialog, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.state.mounted = true;
      this._backing = document.getElementById("mc-content");

      document.body.addEventListener("keydown", this.onKeyDown);
      document.body.addEventListener("keyup", this.onKeyUp);

      setTimeout(this._fadeIn.bind(this), 0);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.state.mounted = false;

      document.body.removeEventListener("keydown", this.onKeyDown);
      document.body.removeEventListener("keyup", this.onKeyUp);
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      var items = this._getTabItems();
      var index = this.state.index;

      if (items.length && index > -1) {
        items[index].focus();
      }
    }
  }, {
    key: "_fadeIn",
    value: function _fadeIn() {
      ReactDOM.findDOMNode(this).style.opacity = "1.0";
    }
  }, {
    key: "show",
    value: function show() {
      this._activeElement = document.activeElement;

      this._focus();

      if (this._backing) {
        this._backing.classList.add("mc-screen");
      }

      document.body.style.overflow = "hidden";
    }
  }, {
    key: "close",
    value: function close(evt) {
      this.hide(false);
    }
  }, {
    key: "hide",
    value: function hide(confirmed, input) {
      if (this.state.mounted) {
        this._blur();

        if (this._backing) {
          this._backing.classList.remove("mc-screen");
        }

        document.body.style.overflow = "scroll";

        if (this.props.onHide) {
          this.props.onHide(!!confirmed, input);
        }

        // unmount self
        ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode(this).parentNode);
      }
    }
  }, {
    key: "onKeyDown",
    value: function onKeyDown(evt) {
      var items = void 0;
      var index = this.state.index;

      if (Keyboard.isTab(evt)) {
        evt.preventDefault();
        items = this._getTabItems();
        index += Keyboard.isNextTab(evt) ? 1 : -1;
        index = (items.length + Math.max(-1, index)) % items.length;

        this.setState({ index: index });
      }
    }
  }, {
    key: "onKeyUp",
    value: function onKeyUp(evt) {
      if (Keyboard.isEscape(evt) && !/INPUT|SELECT|TEXTAREA/.test(evt.target.nodeName)) {
        this.hide(false);
      }
    }
  }, {
    key: "_getTabItems",
    value: function _getTabItems() {
      var node = ReactDOM.findDOMNode(this);
      var items = node.querySelectorAll(this.props.selector);
      var filters = node.querySelectorAll(this.props._filters);

      return [].filter.call(items, function (item) {
        var include = !item.disabled;

        for (var i = 0; i < filters.length; i++) {
          if (filters[i].contains(item)) {
            include = false;
            break;
          }
        }

        return include;
      });
    }
  }, {
    key: "_focus",
    value: function _focus() {
      this.refs.dialog.focus();
    }
  }, {
    key: "_blur",
    value: function _blur() {
      try {
        if (this._activeElement) {
          this._activeElement.focus();
        }
      } catch (e) {}
    }
  }]);

  return Dialog;
}(React.Component);

module.exports = Dialog;

});

require.register("hec-biostamp-core/js/widget/Drop.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Keyboard = require("../lib/Keyboard");

var drops = [];

document.addEventListener("click", function (evt) {
  drops.forEach(function (drop) {
    if (evt && ReactDOM.findDOMNode(drop).contains(evt.target)) {
      return;
    }

    drop.close(false);
  });
});

var Drop = function (_React$Component) {
  _inherits(Drop, _React$Component);

  function Drop(props) {
    _classCallCheck(this, Drop);

    var _this = _possibleConstructorReturn(this, (Drop.__proto__ || Object.getPrototypeOf(Drop)).call(this, props));

    _this.state = {
      opened: false,
      index: _this.getDefaultIndex()
    };
    return _this;
  }

  _createClass(Drop, [{
    key: "getDefaultIndex",
    value: function getDefaultIndex() {
      return (/search|text/.test(this.props.children[0].props.type) ? 0 : -1
      );
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      drops.push(this);
      this.refs.target.firstElementChild.tabIndex = "0";
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      drops = drops.filter(function (drop) {
        return this !== drop;
      }, this);
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps, prevState) {
      var items = void 0;
      var index = this.state.index;

      if (this.state.opened) {
        if (index > -1) {
          items = ReactDOM.findDOMNode(this).querySelectorAll(this.props.selector);
          if (items.length) {
            items[index].focus();
          }
        }
      }

      if (this.state.opened !== prevState.opened) {
        this.props.onToggle(this.state.opened);
      }
    }
  }, {
    key: "_toggle",
    value: function _toggle(evt) {
      if (this.state.opened) {
        this.close();
      } else {
        this._open();
      }
    }
  }, {
    key: "_onClickToggle",
    value: function _onClickToggle(evt) {
      if (this.props.autoToggle) {
        this._toggle();
      }
    }
  }, {
    key: "_onKeyToggle",
    value: function _onKeyToggle(evt) {
      if (this.props.autoToggle && Keyboard.isEnter(evt)) {
        this._toggle();
      }
    }
  }, {
    key: "_onFocusReveal",
    value: function _onFocusReveal(evt) {
      var items = ReactDOM.findDOMNode(this).querySelectorAll(this.props.selector);
      var index = [].indexOf.call(items, evt.target);
      var a = evt.target.nodeName;
      var b = evt.target.parentNode.nodeName;
      var targets = ["A", "BUTTON"];

      if (this.props.autoClose && evt.type === "click" && (targets.includes(a) || targets.includes(b))) {
        this.close(false);
        return;
      }

      this.setState({ index: index });
    }
  }, {
    key: "_onKeyDown",
    value: function _onKeyDown(evt) {
      var items = void 0;
      var index = void 0;

      if (Keyboard.isTab(evt)) {
        this.close();
      } else if (this.state.opened && Keyboard.isUpOrDownArrow(evt)) {
        evt.preventDefault();

        items = ReactDOM.findDOMNode(this).querySelectorAll(this.props.selector);
        index = this.state.index;

        index += Keyboard.isDownArrow(evt) ? 1 : -1;
        index = (items.length + Math.max(-1, index)) % items.length;

        this.setState({ index: index });
      }
    }
  }, {
    key: "_onKeyUp",
    value: function _onKeyUp(evt) {
      if (Keyboard.isEscape(evt)) {
        if (this.state.opened) {
          evt.stopPropagation();
        }
        this.close();
      }
    }
  }, {
    key: "_open",
    value: function _open() {
      if (!this.state.opened) {
        document.body.style.overflowX = "hidden";

        this.setState({
          opened: true,
          index: this.getDefaultIndex()
        });
      }
    }

    // public

  }, {
    key: "close",
    value: function close(_focus) {
      if (this.state.opened) {
        document.body.style.overflowX = "auto";

        this.setState({
          opened: false,
          index: this.getDefaultIndex()
        });

        if (_focus !== false) {
          this.refs.target.firstElementChild.focus();
        }
      }
    }

    // public. open or close, but do not reset tab index

  }, {
    key: "reveal",
    value: function reveal(opened) {
      this.setState({ opened: opened });
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      return React.createElement(
        "div",
        { className: "mc-drop", "data-align": this.props.align, onKeyDown: function onKeyDown(e) {
            return _this2._onKeyDown(e);
          }, onKeyUp: function onKeyUp(e) {
            return _this2._onKeyUp(e);
          } },
        React.createElement(
          "div",
          { ref: "target", className: "mc-drop-target", onClick: function onClick(e) {
              return _this2._onClickToggle(e);
            }, onKeyDown: function onKeyDown(e) {
              return _this2._onKeyToggle(e);
            } },
          this.props.children[0]
        ),
        React.createElement(
          "div",
          { ref: "reveal", className: "mc-drop-reveal", "aria-hidden": !this.state.opened, onFocus: function onFocus(e) {
              return _this2._onFocusReveal(e);
            }, onClick: function onClick(e) {
              return _this2._onFocusReveal(e);
            } },
          this.props.children[1]
        )
      );
    }
  }]);

  return Drop;
}(React.Component);

Drop.defaultProps = {
  selector: "a, button, input, textarea",
  autoToggle: true,
  autoClose: false,
  align: "left",
  onToggle: function onToggle(opened) {}
};

module.exports = Drop;

});

require.register("hec-biostamp-core/js/widget/FormControls.js", function(exports, require, module) {
"use strict";

var FormControls = function FormControls(props) {
  var disabled = props.enabled === false;
  var labels = props.labels || {};

  return React.createElement(
    "div",
    { className: "mc-form-controls" },
    React.createElement(
      "button",
      { className: "mc-button mc-save", onClick: props.onSave, disabled: disabled },
      labels.save || tx("save")
    ),
    React.createElement(
      "button",
      { className: "mc-button mc-cancel", onClick: props.onCancel },
      labels.cancel || tx("cancel")
    ),
    props.onDelete && React.createElement(
      "button",
      { className: "mc-button mc-delete", onClick: props.onDelete },
      labels.delete || tx("delete")
    )
  );
};

module.exports = FormControls;

});

require.register("hec-biostamp-core/js/widget/FormDate.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FormDate = function (_React$Component) {
  _inherits(FormDate, _React$Component);

  function FormDate(props) {
    _classCallCheck(this, FormDate);

    var _this = _possibleConstructorReturn(this, (FormDate.__proto__ || Object.getPrototypeOf(FormDate)).call(this, props));

    _this.state = {
      text: _this.fromIso(props.date),
      date: props.date,
      validating: true
    };
    return _this;
  }

  // "YYYY-MM-DD" to "MM/DD/YYYY"


  _createClass(FormDate, [{
    key: "fromIso",
    value: function fromIso(str) {
      if (str) {
        var s = str.split("-");

        return [+s[1], +s[2], s[0]].join("/");
      }

      return "";
    }

    // "MM/DD/YYYY" to "YYYY-MM-DD"

  }, {
    key: "toIso",
    value: function toIso(str) {
      var s = str.split("/");

      return [s[2], ("0" + s[0]).substr(-2), ("0" + s[1]).substr(-2)].join("-");
    }
  }, {
    key: "onFocus",
    value: function onFocus(evt) {
      this.setState({
        validating: false
      });
    }
  }, {
    key: "onChange",
    value: function onChange(evt) {
      var text = evt.target.value.trim();
      var iso = null;

      this.setState({
        text: text
      });

      if (new RegExp(FormDate.PATTERN).test(text)) {
        iso = this.toIso(text);
      }

      this.props.onChange(iso);
    }
  }, {
    key: "onBlur",
    value: function onBlur(evt) {
      this.setState({
        validating: true
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _props = this.props,
          name = _props.name,
          disabled = _props.disabled;
      var _state = this.state,
          text = _state.text,
          validating = _state.validating;


      return React.createElement(
        "span",
        { className: "mc-form-date" },
        React.createElement("input", {
          type: "text",
          size: "12",
          maxLength: "10",
          pattern: validating ? FormDate.PATTERN : null,
          name: name || "date",
          value: text,
          onChange: this.onChange.bind(this),
          onFocus: this.onFocus.bind(this),
          onBlur: this.onBlur.bind(this),
          disabled: disabled }),
        React.createElement(
          "small",
          null,
          "MM/DD/YYYY"
        )
      );
    }
  }]);

  return FormDate;
}(React.Component);

FormDate.PATTERN = "^\\d{1,2}\/\\d{1,2}\/\\d{4}$";

module.exports = FormDate;

});

require.register("hec-biostamp-core/js/widget/FormFeedback.js", function(exports, require, module) {
"use strict";

var FormFeedback = function FormFeedback(props) {
  if (props.errors.length) {
    return React.createElement(
      "div",
      { className: "mc-form-feedback" },
      tx("oops") + " " + props.errors.join(" ")
    );
  }

  return null;
};

module.exports = FormFeedback;

});

require.register("hec-biostamp-core/js/widget/FormRange.js", function(exports, require, module) {
"use strict";

var FormRange = function FormRange(props) {
  var min = props.min,
      max = props.max,
      _props$step = props.step,
      step = _props$step === undefined ? 1 : _props$step,
      name = props.name,
      value = props.value,
      _props$disabled = props.disabled,
      disabled = _props$disabled === undefined ? false : _props$disabled,
      _props$nullable = props.nullable,
      nullable = _props$nullable === undefined ? false : _props$nullable,
      onChange = props.onChange,
      _props$tx = props.tx,
      tx = _props$tx === undefined ? function (n) {
    return n.toString();
  } : _props$tx;


  var _onChange = function _onChange(evt) {
    var value = evt.target.value;

    onChange(value ? +value : null);
  };

  var opts = [];

  for (var i = min; i <= max; i += step) {
    opts.push(React.createElement(
      "option",
      { key: i, value: i },
      tx(i)
    ));
  }

  if (nullable) {
    opts.unshift(React.createElement("option", { key: "null" }));
  }

  return React.createElement(
    "select",
    { name: name, value: value, onChange: _onChange, disabled: disabled },
    opts
  );
};

module.exports = FormRange;

});

require.register("hec-biostamp-core/js/widget/IconButton.js", function(exports, require, module) {
"use strict";

var IconButton = function IconButton(props) {
  var src = props.icon.indexOf(".") === 0 ? props.icon : "./img/mc/icon." + props.icon + ".svg";
  var scale = props.scale || 1;
  var width = 20;
  var height = 20;
  var weight = props.weight || "normal";
  var display = props.display || "tooltip";
  var tooltip = display === "tooltip" ? props.label : null;
  var text = display === "text" ? React.createElement(
    "span",
    null,
    props.label
  ) : null;

  return React.createElement(
    "button",
    {
      className: "mc-icon-button",
      id: props.id,
      "data-tooltip": tooltip,
      "data-display": display,
      "data-weight": weight,
      "aria-label": props.label,
      disabled: !!props.disabled,
      "aria-pressed": [true, false].includes(props.pressed) ? !!props.pressed : null,
      onClick: props.onPress },
    React.createElement("img", { src: src, width: width * scale, height: height * scale }),
    text
  );
};

module.exports = IconButton;

});

require.register("hec-biostamp-core/js/widget/Meter.js", function(exports, require, module) {
"use strict";

var Utils = require("../lib/Utils");

var Meter = function Meter(props) {
  var _props$percent = props.percent,
      percent = _props$percent === undefined ? 0 : _props$percent,
      _props$width = props.width,
      width = _props$width === undefined ? 100 : _props$width,
      _props$height = props.height,
      height = _props$height === undefined ? 10 : _props$height,
      _props$rounded = props.rounded,
      rounded = _props$rounded === undefined ? true : _props$rounded,
      _props$color = props.color,
      color = _props$color === undefined ? "#0078bc" : _props$color,
      _props$animate = props.animate,
      animate = _props$animate === undefined ? false : _props$animate,
      label = props.label;


  var r = rounded ? Math.ceil(height / 2) : 0;
  var w = percent ? Math.max(height, width * Math.min(percent, 1)) : 0;

  var id = Utils.id();

  return React.createElement(
    "svg",
    { className: "mc-meter", width: width, height: height, "aria-label": label, "data-tooltip": label },
    React.createElement(
      "defs",
      null,
      React.createElement(
        "clipPath",
        { id: id },
        React.createElement("rect", { width: width, height: height, rx: r, ry: r })
      )
    ),
    React.createElement("rect", { width: width, height: height, fill: "#e4e4e4", rx: r, ry: r }),
    React.createElement("rect", {
      width: w,
      height: height,
      fill: color,
      rx: r,
      ry: r,
      "data-animate": animate,
      clipPath: "url(#" + id + ")" })
  );
};

module.exports = Meter;

});

require.register("hec-biostamp-core/js/widget/Modal.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Dialog = require("./Dialog");
var CloseButton = require("./CloseButton");

var Modal = function (_Dialog) {
  _inherits(Modal, _Dialog);

  function Modal() {
    _classCallCheck(this, Modal);

    return _possibleConstructorReturn(this, (Modal.__proto__ || Object.getPrototypeOf(Modal)).apply(this, arguments));
  }

  _createClass(Modal, [{
    key: "onFocus",
    value: function onFocus(evt) {
      var items = this._getTabItems();
      var index = [].indexOf.call(items, evt.target);

      if (index > -1) {
        // anti-pattern! to avoid recursion on focus()
        this.state.index = index;
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _props = this.props,
          width = _props.width,
          height = _props.height,
          minWidth = _props.minWidth,
          maxWidth = _props.maxWidth,
          dismissable = _props.dismissable,
          label = _props.label,
          labeledBy = _props.labeledBy,
          verticalAlign = _props.verticalAlign,
          children = _props.children;


      var button = null;

      if (dismissable) {
        var top = "calc((100% - " + height + ") / 2)";

        button = React.createElement(
          "div",
          { className: "mc-modal-close mc-screen", style: { top: top, width: width, minWidth: minWidth, maxWidth: maxWidth } },
          React.createElement(CloseButton, { color: "#333333", size: 20, onClick: this.close.bind(this), tabIndex: "0" })
        );
      }

      return React.createElement(
        "div",
        { className: "mc-modal-scrim", tabIndex: "0" },
        React.createElement(
          "div",
          {
            className: "mc-modal-dialog",
            style: { width: width, height: height, minWidth: minWidth, maxWidth: maxWidth },
            ref: "dialog",
            role: "dialog",
            "aria-label": label,
            "aria-labelledby": labeledBy,
            tabIndex: "-1" },
          React.createElement(
            "div",
            { className: "mc-modal-body", "data-align": verticalAlign, onFocus: this.onFocus.bind(this) },
            children
          )
        ),
        button
      );
    }
  }]);

  return Modal;
}(Dialog);

Modal.defaultProps = {
  dismissable: true,
  verticalAlign: "top",
  width: "75%",
  height: "75%",
  minWidth: "400px",
  maxWidth: "800px",
  label: null,
  labeledBy: null,
  selector: "a, button, input, select, textarea, [tabindex='0']",
  _filters: ".mc-drop-reveal"
};

module.exports = Modal;

});

require.register("hec-biostamp-core/js/widget/Orderable.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var OrderableRow = function OrderableRow(props) {
  var dragStart = function dragStart(evt) {
    if (["INPUT", "TEXTAREA"].includes(evt.target.nodeName)) {
      return;
    }

    evt.dataTransfer.effectAllowed = "move";
    evt.dataTransfer.setData("text/plain", "Whee");
  };

  var dragEnter = function dragEnter(evt) {
    if (evt.dataTransfer.effectAllowed === "move") {
      evt.preventDefault();
      props.onOver();
    }
  };

  var dragOver = function dragOver(evt) {
    if (evt.dataTransfer.effectAllowed === "move") {
      evt.preventDefault();
    }
  };

  var drop = function drop(evt) {
    if (evt.dataTransfer.effectAllowed === "move") {
      evt.preventDefault();
      props.onDrop();
    }
  };

  return React.createElement(
    "div",
    {
      className: "mc-orderable-item",
      "data-dragging": props.dragging,
      "data-targeted": props.targeted,
      draggable: props.dragging || null,
      onDragStart: dragStart,
      onDragEnter: dragEnter,
      onDragOver: dragOver,
      onDragEnd: props.onRelease,
      onDrop: drop },
    React.createElement("div", { className: "mc-orderable-handle",
      onMouseDown: props.onPick,
      onMouseUp: props.onRelease }),
    React.createElement(
      "div",
      { className: "mc-orderable-content" },
      props.children
    )
  );
};

var Orderable = function (_React$Component) {
  _inherits(Orderable, _React$Component);

  function Orderable(props) {
    _classCallCheck(this, Orderable);

    var _this = _possibleConstructorReturn(this, (Orderable.__proto__ || Object.getPrototypeOf(Orderable)).call(this, props));

    _this.state = {
      dragIdx: null,
      overIdx: null
    };
    return _this;
  }

  _createClass(Orderable, [{
    key: "pick",
    value: function pick(idx) {
      this.setState({
        dragIdx: idx
      });
    }
  }, {
    key: "over",
    value: function over(idx) {
      this.setState({
        overIdx: idx
      });
    }
  }, {
    key: "release",
    value: function release(idx) {
      this.setState({
        dragIdx: null,
        overIdx: null
      });
    }
  }, {
    key: "drop",
    value: function drop(idx) {
      var children = this.props.children;
      var a = this.state.dragIdx;
      var b = idx;
      var c = [];
      var d = [];

      if (a !== b) {
        for (var i = 0, j = React.Children.count(children); i < j; i++) {
          c.push(i);
          d.push(children[i].props.orderId);
        }

        c.splice(a, 1);
        c.splice(b, 0, a);

        this.props.onOrder(c.map(function (i) {
          return d[i];
        }));
      }

      this.release(idx);
    }
  }, {
    key: "render",
    value: function render() {
      var i = 0;

      var rows = React.Children.map(this.props.children, function (child) {
        var idx = i++;
        var dragging = idx === this.state.dragIdx;
        var targeted = idx === this.state.overIdx && !dragging;

        if (targeted) {
          // "before", "after" or false
          targeted = this.state.dragIdx > this.state.overIdx ? "before" : "after";
        }

        return React.createElement(
          OrderableRow,
          {
            key: child.props.orderId,
            dragging: dragging,
            targeted: targeted,
            onPick: this.pick.bind(this, idx),
            onOver: this.over.bind(this, idx),
            onRelease: this.release.bind(this, idx),
            onDrop: this.drop.bind(this, idx) },
          child
        );
      }, this);

      return React.createElement(
        "div",
        { className: "mc-orderable" },
        rows
      );
    }
  }]);

  return Orderable;
}(React.Component);

module.exports = Orderable;

});

require.register("hec-biostamp-core/js/widget/Pulse.js", function(exports, require, module) {
"use strict";

var Pulse = function Pulse(props) {
  var size = props.size || 100;
  var margin = props.margin || 0;
  var fill = props.color || "#43b4db";
  var d = "M0.35630016,56.0000019 C3.32043455,80.7853609 24.4163076,100 50,100 C77.6142375,100 100,77.6142375 100,50 C100,22.3857625 77.6142375,0 50,0 L50,9 C72.6436747,9 91,27.3563253 91,50 C91,72.6436747 72.6436747,91 50,91 C29.394481,91 12.3392385,75.799459 9.43589752,56.0000019 L0.35630016,56.0000019 L0.35630016,56.0000019 Z";

  return React.createElement(
    "div",
    { className: "mc-pulse", style: { margin: margin } },
    React.createElement(
      "svg",
      { width: size, height: size },
      React.createElement(
        "g",
        { transform: "scale(" + size / 100 + ")" },
        React.createElement("path", { d: d, fill: fill })
      )
    )
  );
};

module.exports = Pulse;

});

require.register("hec-biostamp-core/js/widget/QuickSearch.js", function(exports, require, module) {
"use strict";

var QuickSearch = function QuickSearch(props) {
  var _props$term = props.term,
      term = _props$term === undefined ? "" : _props$term,
      results = props.results,
      placeholder = props.placeholder,
      onChange = props.onChange,
      onSubmit = props.onSubmit;


  var doChange = function doChange(evt) {
    onChange(evt.target.value);
  };

  var doSubmit = function doSubmit(evt) {
    if (results.length === 1) {
      onSubmit(results[0]);
    }

    if (evt) {
      evt.preventDefault();
    }
  };

  return React.createElement(
    "form",
    { className: "mc-quick-search", onSubmit: doSubmit },
    React.createElement("input", {
      type: "search",
      value: term,
      onChange: doChange,
      placeholder: placeholder,
      "data-matched": term.length > 0 && results.length === 1 })
  );
};

module.exports = QuickSearch;

});

require.register("hec-biostamp-core/js/widget/Slider.js", function(exports, require, module) {
"use strict";

var IconButton = require("./IconButton");

var Slider = function Slider(props) {
  var _props$value = props.value,
      value = _props$value === undefined ? 1 : _props$value,
      label = props.label,
      _onChange = props.onChange,
      _props$min = props.min,
      min = _props$min === undefined ? 1 : _props$min,
      _props$max = props.max,
      max = _props$max === undefined ? 10 : _props$max,
      _props$step = props.step,
      step = _props$step === undefined ? 1 : _props$step,
      _props$disabled = props.disabled,
      disabled = _props$disabled === undefined ? false : _props$disabled,
      _props$width = props.width,
      width = _props$width === undefined ? 150 : _props$width;


  return React.createElement(
    "div",
    { className: "mc-slider" },
    React.createElement("input", {
      type: "range",
      min: min,
      max: max,
      value: value,
      disabled: disabled,
      step: step,
      style: { width: width },
      onChange: function onChange(evt) {
        return _onChange(parseInt(evt.target.value));
      } }),
    React.createElement(IconButton, {
      scale: 0.8,
      icon: "minus",
      onPress: function onPress() {
        return _onChange(Math.max(min, Math.min(value - step, max)));
      },
      disabled: disabled || value <= min }),
    React.createElement(IconButton, {
      scale: 0.8,
      icon: "plus",
      onPress: function onPress() {
        return _onChange(Math.max(min, Math.min(value + step, max)));
      },
      disabled: disabled || value >= max }),
    React.createElement(
      "span",
      null,
      label || value
    )
  );
};

module.exports = Slider;

});

require.register("hec-biostamp-core/js/widget/Spinner.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Spinner = function (_React$Component) {
  _inherits(Spinner, _React$Component);

  function Spinner(props) {
    _classCallCheck(this, Spinner);

    var _this = _possibleConstructorReturn(this, (Spinner.__proto__ || Object.getPrototypeOf(Spinner)).call(this, props));

    _this.timeout = null;

    _this.state = {
      spins: 0,
      message: undefined
    };
    return _this;
  }

  _createClass(Spinner, [{
    key: "spin",
    value: function spin() {
      var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var message = arguments[1];

      var spins = this.state.spins + n;

      if (spins < 0 || n === 0) {
        spins = 0;
      }

      if (n > 0) {
        this.setState({ message: message });
      }

      if (spins > 0) {
        this.setState({ spins: spins });
      } else {
        clearTimeout(this.timeout);

        this.timeout = setTimeout(function () {
          this.setState({ spins: spins });
        }.bind(this), 350);
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _state = this.state,
          spins = _state.spins,
          message = _state.message;


      return React.createElement(
        "div",
        { className: "mc-spinner", "aria-hidden": spins <= 0 },
        message || tx("loading")
      );
    }
  }]);

  return Spinner;
}(React.Component);

module.exports = Spinner;

});

require.register("hec-biostamp-core/js/widget/Table.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var sortByProps = function sortByProps(props) {
  return function (row1, row2) {
    var a = void 0;
    var b = void 0;

    for (var i = 0; i < props.length; i++) {
      a = row1[props[i]];
      b = row2[props[i]];

      if (a !== b) {
        break;
      }
    }

    return (a || "") > (b || "") ? 1 : -1;
  };
};

var Table = function (_React$Component) {
  _inherits(Table, _React$Component);

  function Table() {
    _classCallCheck(this, Table);

    return _possibleConstructorReturn(this, (Table.__proto__ || Object.getPrototypeOf(Table)).apply(this, arguments));
  }

  _createClass(Table, [{
    key: "render",
    value: function render() {
      var data = [].concat(this.props.data);

      var cols = this.props.cols.map(function (col, i) {
        return React.createElement("col", { width: col.width, key: i });
      });

      var thead = this.props.cols.map(function (col) {
        var sort = col.sort;
        var sortable = !!sort;

        if (col.prop === this.props.sort) {
          if (sort === true) {
            sort = col.prop;
          }

          if (typeof sort !== "function") {
            sort = sortByProps([].concat(sort, this.props.rowKey));
          }

          data.sort(sort);
        }

        var handleClick = function (evt) {
          var direction = col.prop === this.props.sort ? this.props.direction * -1 : 1;

          this.props.onSort(col.prop, direction);
        }.bind(this);

        return React.createElement(
          "th",
          {
            key: col.prop,
            "data-key": col.prop,
            onClick: sortable ? handleClick : undefined,
            "data-sortable": sortable,
            "data-sorted": !!sort && col.prop === this.props.sort ? this.props.direction : null },
          col.label
        );
      }, this);

      var rows = data.map(function (row, i) {
        var cols = this.props.cols.map(function (col) {
          return React.createElement(
            "td",
            { key: col.prop, "data-key": col.prop, "data-clip": !!col.clip },
            col.content && col.content(row, i, data.length) || row[col.prop]
          );
        });

        var key = row[this.props.rowKey];

        return React.createElement(
          "tr",
          { key: key, "data-key": key },
          cols
        );
      }, this);

      if (this.props.direction === -1) {
        rows.reverse();
      }

      return React.createElement(
        "table",
        { className: "mc-table", "data-align": this.props.align, id: this.props.id },
        React.createElement(
          "colgroup",
          null,
          cols
        ),
        React.createElement(
          "thead",
          null,
          React.createElement(
            "tr",
            null,
            thead
          )
        ),
        React.createElement(
          "tbody",
          null,
          rows
        )
      );
    }
  }]);

  return Table;
}(React.Component);

Table.defaultProps = {
  rowKey: "id",
  cols: [],
  data: [], // TODO rename "rows"
  sort: null,
  direction: 1,
  onSort: null,
  align: "top"
};

module.exports = Table;

});

require.register("hec-biostamp-core/js/widget/Tabs.js", function(exports, require, module) {
"use strict";

function Tabs(props) {
  var _props$role = props.role,
      role = _props$role === undefined ? "tablist" : _props$role,
      _props$rounded = props.rounded,
      rounded = _props$rounded === undefined ? false : _props$rounded,
      _props$disabled = props.disabled,
      disabled = _props$disabled === undefined ? false : _props$disabled,
      options = props.options,
      value = props.value,
      onSelect = props.onSelect,
      id = props.id;


  var t = role === "tablist";

  return React.createElement(
    "ul",
    { className: "mc-tabs", role: t ? "tablist" : "radiogroup", id: id, "data-rounded": rounded, "aria-disabled": disabled },
    options.map(function (opt) {
      var selected = opt.value === value;
      var src = null;

      if (opt.icon) {
        src = opt.icon.indexOf(".") === 0 ? opt.icon : "./img/mc/icon." + opt.icon + ".svg";
      }

      return React.createElement(
        "li",
        {
          key: opt.value,
          role: t ? "tab" : "radio",
          "aria-selected": t ? selected : null,
          "aria-checked": !t ? selected : null },
        React.createElement(
          "button",
          { disabled: disabled || opt.disabled, onClick: onSelect.bind(null, opt.value, !selected) },
          src ? React.createElement("img", { src: src, height: "18" }) : null,
          React.createElement(
            "span",
            null,
            opt.label
          )
        )
      );
    })
  );
};

module.exports = Tabs;

});

require.register("hec-biostamp-core/js/widget/Toggle.js", function(exports, require, module) {
"use strict";

var Toggle = function Toggle(props) {
  var pressed = props.pressed === true;
  var disabled = props.disabled === true;
  var labels = props.labels || ["Off", "On"];
  var onPress = props.onPress;
  var background = pressed ? props.background : null;

  return React.createElement(
    "button",
    {
      id: props.id,
      className: "mc-toggle",
      role: "button",
      "aria-pressed": pressed,
      disabled: disabled,
      style: { background: background },
      onClick: onPress.bind(null, !pressed) },
    React.createElement("span", null),
    labels[pressed & 1]
  );
};

module.exports = Toggle;

});

require.register("hec-biostamp-core/js/widget/Tooltip.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _target = void 0;
var _rect = void 0;
var _text = void 0;
var _extent = void 0;
var _doc = document.documentElement; // IE

var Tooltip = function (_React$Component) {
  _inherits(Tooltip, _React$Component);

  function Tooltip(props) {
    _classCallCheck(this, Tooltip);

    var _this = _possibleConstructorReturn(this, (Tooltip.__proto__ || Object.getPrototypeOf(Tooltip)).call(this, props));

    var rect = { top: 0, left: 0, width: 0, height: 0 };

    _this.show = _this.show.bind(_this);
    _this.hide = _this.hide.bind(_this);

    _this.state = {
      visible: false,
      text: "",
      targetRect: rect,
      tipRect: rect
    };
    return _this;
  }

  _createClass(Tooltip, [{
    key: "_show",
    value: function _show(evt) {
      var target = evt.target;
      var top = void 0;
      var left = void 0;
      var right = void 0;
      var width = void 0;
      var height = void 0;
      var node = void 0;

      if (_target) {
        if (_target.contains && _target.contains(target)) {
          return;
        }

        if (_target !== target) {
          this._hide();
        }
      }

      if (target.getAttribute) {
        _text = target.getAttribute("data-tooltip");
      }

      if (_text) {
        _rect = target.getBoundingClientRect();

        _extent = {
          left: 0,
          right: window.innerWidth
        };

        top = _rect.top + (window.scrollY || _doc.scrollTop);
        left = Math.max(_extent.left, _rect.left + (window.scrollX || _doc.scrollLeft));
        right = Math.min(_extent.right, _rect.right);
        width = right - left;
        height = _rect.height;

        node = ReactDOM.findDOMNode(this);

        this.setState({
          text: _text,
          orient: _rect.top > 50 ? "top" : "bottom",
          align: left > window.innerWidth - 65 && _text.length > 5 ? "right" : "center",
          targetRect: {
            top: top,
            left: left,
            width: width,
            height: height
          }
        }, function () {
          this.setState({
            tipRect: node.getBoundingClientRect(),
            visible: true
          });
        });

        _target = target;
      }
    }
  }, {
    key: "_hide",
    value: function _hide(evt) {
      _target = null;

      this.setState({
        visible: false
      });
    }
  }, {
    key: "show",
    value: function show(target) {
      this._show({ target: target });
    }
  }, {
    key: "hide",
    value: function hide() {
      if (this.state.visible) {
        this._hide();
      }
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      document.addEventListener("mouseover", this._show.bind(this));
      document.addEventListener("click", this._hide.bind(this));
      document.addEventListener("scroll", this._hide.bind(this));
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      document.removeEventListener("mouseover", this._show.bind(this));
      document.removeEventListener("click", this._hide.bind(this));
      document.removeEventListener("scroll", this._hide.bind(this));
    }
  }, {
    key: "render",
    value: function render() {
      var _state = this.state,
          targetRect = _state.targetRect,
          tipRect = _state.tipRect,
          orient = _state.orient,
          align = _state.align,
          text = _state.text,
          visible = _state.visible;

      var offsets = {};
      var style = {};

      if (visible) {
        offsets = {
          top: -tipRect.height - 10,
          bottom: targetRect.height + 10,
          center: (targetRect.width - tipRect.width) / 2,
          right: -tipRect.width + 34
        };

        style.opacity = 1;
        style.top = targetRect.top + offsets[orient];
        style.left = targetRect.left + offsets[align];
      } else {
        style.opacity = 0;
        style.top = 0;
        style.left = 0;
      }

      return React.createElement(
        "div",
        {
          style: style,
          className: "mc-screen mc-tooltip",
          "data-orient": orient,
          "data-align": align,
          role: "tooltip",
          "aria-hidden": !visible },
        text
      );
    }
  }]);

  return Tooltip;
}(React.Component);

module.exports = Tooltip;

});

require.alias("process/browser.js", "process");process = require('process');require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');


//# sourceMappingURL=mc.js.map