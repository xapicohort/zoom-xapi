define(function (require) {
  var $ = require('jquery');

  require(['xapiwrapper', 'datatables', 'cookie', 'transition', 'collapse', 'prettify', 'datetimepicker', 'notify'], function () {

    $(document).ready(function () {
      function parseQuery(fullQuery) {
        fullQuery = fullQuery || window.location.search || window.location.href || '';
        if (!fullQuery) { return; }
        var query = {};
        var queryString = fullQuery.split('?')[1];
        if (!queryString) { return query };
        var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
        for (var i = 0; i < pairs.length; i++) {
          var pair = pairs[i].split('=');
          query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
        }
        return query;
      }

      // shim for old-style Base64 lib
      function fromBase64(text) {
        if (CryptoJS && CryptoJS.enc.Base64)
          return CryptoJS.enc.Base64.parse(text).toString(CryptoJS.enc.Latin1);
        else
          return Base64.decode(text);
      }

      function resetConfig(opts) {
        $('#statement-list').DataTable().clear();

        var qs = parseQuery();

        var isCurrentlySandbox = qs && qs.sandbox;
        var setToSandbox = opts && opts.sandbox;

        var historyState = window.location.pathname; // base URL

        if (setToSandbox) {
          if (isCurrentlySandbox) {
            return;
          }

          historyState = historyState + '?sandbox=true';
        }

        console.log('historyState:', historyState);
        window.history.replaceState(null, null, historyState);

        setupConfig();
        getStatementsWithSearch(null, 0);
      }

      function getConfig() {
        var qs = parseQuery();

        var isSandbox = qs && qs.sandbox;

        var btnProduction = document.querySelector('.btn.production');
        var btnSandbox = document.querySelector('.btn.sandbox');

        var config = {
          endpoint: 'https://zoom-api.lrs.io/xapi/',
          username: 'potijw',
          password: 'hddZYOUQ'
        };

        if (isSandbox) {
          config = {
            endpoint: 'https://zoom-api-sandbox.lrs.io/xapi/',
            username: 'dupejo',
            password: 'qupvwvrw'
          };

          btnProduction.classList.remove('selected');
          btnSandbox.classList.add('selected');
        } else {
          btnProduction.classList.add('selected');
          btnSandbox.classList.remove('selected');
        }

        return config;
      }

      function setupConfig() {
        var cfg = getConfig();

        var conf = {
          "endpoint": cfg.endpoint,
          "auth": "Basic " + toBase64(cfg.username + ":" + cfg.password),
        };

        ADL.XAPIWrapper.changeConfig(conf);
      }

      // Configure xAPIWrapper and save credentials
      setupConfig();

      var notificationSettings = {
        animate: {
          enter: 'animated fadeInUp',
          exit: 'animated fadeOutDown'
        },
        type: "success",
        placement: {
          from: "bottom",
          align: "right"
        },
      };

      var notificationErrorSettings = jQuery.extend(true, {}, notificationSettings);
      notificationErrorSettings.type = "danger";

      var dateTimeSettings = {
        // format: 'YYYY-MM-DDTHH:mm:ss', // ISO 8601
        showTodayButton: true,
        showClear: true
      };

      gmore = null;

      $("#reset-search").click(function (e) {
        $("#search-predefined-verb").val("");
        $("#search-verb-sort").val("");
        $("#search-user-verb-id").val("");
        $("#search-actor-email").val("");
        $("#search-related-agents").val("");
        $("#search-activity-id").val("");
        $("#search-related-activities").val("");
        $("#search-registration-id").val("");
        $("#search-statement-id").val("");
        $("#search-voided-statement-id").val("");
        $("#search-statements-since-date input").val("");
        $("#search-statements-until-date input").val("");
        $("#search-limit").val("");
        e.preventDefault();
      });

      // Handle XAPIWrapper XHR Errors
      ADL.xhrRequestOnError = function (xhr, method, url, callback, callbackargs) {
        //console.log(xhr);
        $.notify({ title: "Status " + xhr.status + " " + xhr.statusText + ": ", message: xhr.response }, notificationErrorSettings);
      };

      var table = $('#statement-list').DataTable({
        "columns": [
          { width: "10%", data: "timestamp", "defaultContent": "" },
          { width: "17%", data: "actor.name", "defaultContent": "" },
          { width: "20%", data: "actor.account.name", "defaultContent": "" },
          {
            width: "13%", data: function (row, type, val, meta) {
              if ('display' in row.verb) {
                if (!('en-US' in row.verb.display)) {
                  if ('en' in row.verb.display) {
                    return row.verb.display.en;
                  }
                }
                return row.verb.display['en-US'];
              }
            }, "defaultContent": ""
          },
          { width: "28%", data: "object.definition.name.en-US", "defaultContent": "" },
          // { width: "12%", data: "object.objectType", "defaultContent": "" },
          // { width: "15%", data: "authority.name", "defaultContent": "" },
          {
            width: "5%",
            "className": 'details-control',
            "orderable": false,
            "data": null,
            "defaultContent": ''
          }
        ],
        "rowCallback": function (row, data) {
          var display = moment(data.timestamp);

          $('td:eq(0)', row).html('<span title="' + data.timestamp + '">' + display.fromNow() + '</span>');

          if (data.actor.hasOwnProperty('account') && data.actor.account.hasOwnProperty('name')) {
            var nameVal = data.actor.name;
            
            if (!nameVal) {
              nameVal = data.actor.account.name;
            }

            $('td:eq(1)', row).html(nameVal);
          } else if (data.actor.hasOwnProperty('name') == false && data.actor.hasOwnProperty('mbox')) {
            $('td:eq(1)', row).html(data.actor.mbox.replace('mailto:', ''));
          }

          if (data.object.hasOwnProperty('name')) {
            $('td:eq(3)', row).html(data.object.name);
          } else if (data.object.hasOwnProperty('definition') && data.object.definition.hasOwnProperty('name') == false && data.object.hasOwnProperty('id')) {
            $('td:eq(3)', row).html(data.object.id);
          } else if (data.object.hasOwnProperty('id') && data.object.hasOwnProperty('definition') == false) {
            $('td:eq(3)', row).html(data.object.id);
          }
        },
        "order": [[0, 'desc']],
        "pageLength": 25
      });

      // Retreive statements from the LRS
      function getStatementsWithSearch(more, curPage) {
        var verbSort = $("#search-verb-sort").val();
        var verbId = $("#search-user-verb-id").val();
        var actor = $("#search-actor").val();
        var relatedAgents = $("#search-related-agents").val();
        var activityId = $("#search-activity-id").val();
        var relatedActivities = $("#search-related-activities").val();
        var registrationId = $("#search-registration-id").val();
        var statementId = $("#search-statement-id").val();
        var voidedStatementId = $("#search-voided-statement-id").val();
        var sinceDate = $("#search-statements-since-date input").val();
        var untilDate = $("#search-statements-until-date input").val();
        var limit = $("#search-limit").val();

        // Build Search
        var search = ADL.XAPIWrapper.searchParams();
        if (verbId != "") { search['verb'] = verbId; }
        if (verbSort != "") { search['ascending'] = verbSort; }
        if (actor != "") { search['agent'] = actor; }
        if (relatedAgents != "") { search['related_agents'] = relatedAgents; }
        if (activityId != "") { search['activity'] = activityId; }
        if (relatedActivities != "") { search['related_activities'] = relatedActivities; }
        if (registrationId != "") { search['registration'] = registrationId; }
        if (statementId != "") { search['statementId'] = statementId; }
        if (voidedStatementId != "") { search['voidedStatementId'] = voidedStatementId; }
        if (sinceDate != "") { search['since'] = sinceDate; }
        if (untilDate != "") { search['until'] = untilDate; }
        if (limit != "") { search['limit'] = limit; }
        //console.log(search);

        // Put together the xAPI Query
        var urlparams = new Array();
        var url = "https://lrs.adlnet.gov/xapi/statements";

        for (s in search) {
          urlparams.push(s + "=" + encodeURIComponent(search[s]));
        }
        if (urlparams.length > 0)
          url = url + "?" + urlparams.join("&");

        //console.log(url);
        $("#xapi-query").val(url);

        ADL.XAPIWrapper.getStatements(search, more, function (r) {
          //console.log(r);
          var response = $.parseJSON(r.response);

          // update the status in the HTML
          if (r.status == 200) {

            // Handle case where only a single statement is returned
            // using statementId or voidedStatementId
            if (response.hasOwnProperty('statements')) {
              var stmts = response.statements;
              var length = stmts.length;
            } else {
              var stmt = response;
              var length = 1;
            }

            $.notify({ message: "Status " + r.status + " " + r.statusText }, notificationSettings);

            if (response.more != "") {
              gmore = response.more;
            } else {
              gmore = null;
            }
            //console.log(gmore);

            if (length > 0) {
              if (stmt) {
                var stmts = $.parseJSON("[" + JSON.stringify(stmt) + "]");
              } else {
                var stmts = $.parseJSON(JSON.stringify(stmts));
                //console.log(stmts);
              }
            }

            $('#statement-list').DataTable().rows.add(stmts).draw();
            $('#statement-list').DataTable().page(curPage).draw(false);
            prettyPrint();
          }
        });
      }

      /* Formatting function for row details - modify as you need */
      function format(d) {
        // `d` is the original data object for the row
        return '<div><pre class="prettyprint lang-js">' +
          JSON.stringify(d, null, 2) +
          '</pre></div>';
      }

      // Add event listener for opening and closing details
      $('#statement-list tbody').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = table.row(tr);

        if (row.child.isShown()) {
          // This row is already open - close it
          row.child.hide();
          tr.removeClass('shown');
        }
        else {
          // Open this row
          row.child(format(row.data())).show();
          tr.addClass('shown');
          PR.prettyPrint();
        }
      });

      // save panel state
      $("#query-options").on('shown.bs.collapse', function () {
        var active = $("#query-options.in").attr('id');
        $.cookie('activePanel', active);
      });
      $("#query-options").on('hidden.bs.collapse', function () {
        $.removeCookie('activePanel');
      });
      var last = $.cookie('activePanel');
      if (last != null) {
        $("#query-options.panel-collapse").removeClass('in');
        $("#" + last).addClass("in");
      }

      $(".collapser a").click(function (e) { e.preventDefault(); });

      // Populate the predefined verbs dropdown
      for (var key in ADL.verbs) {
        var $options = $("#search-predefined-verb");
        if (ADL.verbs.hasOwnProperty(key)) {
          $options.append($("<option />").val(ADL.verbs[key]['id']).text(ADL.verbs[key]['display']['en-US']));
        }
      }

      $('#search-statements-since-date').datetimepicker(dateTimeSettings);
      $('#search-statements-until-date').datetimepicker(dateTimeSettings);

      $("#search-predefined-verb").change(function () {
        var $this = $(this);
        $("#search-user-verb-id").val($this.val());
      });

      $("#get-statements-with-search").click(function (e) {
        $('#statement-list').DataTable().clear();
        getStatementsWithSearch(null, 0);
        e.preventDefault();
      });

      // Populate the table
      getStatementsWithSearch(null, 0);

      $("#more").click(function (e) {
        if (gmore != null) {
          var curPage = $('#statement-list').DataTable().page();
          getStatementsWithSearch(gmore, curPage);
        } else {
          $.notify({ message: "No more statments!" }, notificationErrorSettings);
        }
        e.preventDefault();
      });

      $('.env-switcher .btn').on('click', function (e) {
        if ($(this).hasClass('production')) {
          resetConfig();
        } else {
          resetConfig({ sandbox: true });
        }
      });

    });
  });
});
