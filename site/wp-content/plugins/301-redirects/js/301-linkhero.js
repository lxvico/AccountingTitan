/**
 * 301 Redirects Pro
 * https://wp301redirects.com/
 * (c) WebFactory Ltd, 2019 - 2021, www.webfactoryltd.com
 */

jQuery(function ($) {
  let check_links_timeout;
  var $wrapper = $("#wf301_scanner");

  $wrapper.on("click", ".check-links", function (e) {
    e.preventDefault();

    check_links($(this).data("force"));

    if (!$(this).data("force")) {
      $("#lh_results").html('<tr class="lh-results-loader"><td><img src=' + linkhero.loader + " /><br />Starting scan ...</td></tr>");
    }
  });

  const urlParams = new URLSearchParams(window.location.search);
  var current_tab = '';
  $(document).ready(function(){
    check_scanner_tab();
  });

  $('body').on('click', '.wf301-main-tab > .ui-tabs-tab', function(){
    check_scanner_tab();
  });

  function check_scanner_tab(){
    current_tab = $('.wf301-main-tab > .ui-tabs-active').attr('aria-controls');
    
    if ((current_tab == "wf301_scanner") && linkhero.link_checking_enabled) {
        check_links();
        $("#lh_results").html('<tr class="lh-results-loader"><td><img src=' + linkhero.loader + " /><br />Loading results...</td></tr>");
    }
  }

  $(".lh-results-topbar").on("change", "#lh-per-page", function () {
    $("#lh-pagination-page").val(1);
    $("#lh_results").html('<tr class="lh-results-loader"><td><img src=' + linkhero.loader + " /><br />Generating list of pages</td></tr>");
    check_links(false, true);
  });

  $(".lh-results-topbar").on("change", "#lh-pagination-page", function () {
    $("#lh_results").html('<tr class="lh-results-loader"><td><img src=' + linkhero.loader + " /><br />Generating list of pages</td></tr>");
    check_links(false, true);
  });

  $(".lh-results-topbar").on("click", "li[data-page]", function () {
    $("#lh_results").html('<tr class="lh-results-loader"><td><img src=' + linkhero.loader + " /><br />Generating list of pages</td></tr>");
    $("#lh-pagination-page").val($(this).data("page"));
    check_links(false, true);
  });

  $(".lh-results-topbar").on("change", "#lh-page-order", function () {
    $("#lh_results").html('<tr class="lh-results-loader"><td><img src=' + linkhero.loader + " /><br />Generating list of pages</td></tr>");
    check_links(false, true);
  });

  var lh_failed_retries = 0;

  function check_links(force, display) {
    $("#lh_results").show();
    let loader_html = '<img class="linkhero-loader" src=' + linkhero.loader + " />";
    if (force) {
      clearTimeout(check_links_timeout);
    }

    var per_page = $("#lh-per-page").val();
    var page = $("#lh-pagination-page").val();
    var order = $("#lh-page-order").val();

    if (!(page > 0)) {
      page = 1;
    }

    $.ajax({
      url: ajaxurl,
      method: "POST",
      crossDomain: true,
      dataType: "json",
      timeout: 30000,
      data: {
        _ajax_nonce: linkhero.nonce_ajax,
        action: "linkhero_run_tool",
        force: force,
        display: display,
        tool: "check_links",
        page: page,
        per_page: per_page,
        order: order,
      },
    })
      .done(function (response) {
        if (response.success == true) {
          if (force == true) {
            location.reload();
            return;
          }

          $(".lh-page").remove();
          if (response.data.status == "scan_pending" || response.data.status == "pending") {
            $(".check-links").hide();
            $('.check-links[data-force="true"]').show();
          }

          if(response.data.status == 'sitemap_error'){
            clearTimeout(check_links_timeout);
            $("#lh_results").hide();
            $(".lh-results-stats").hide();
            
            wf301_swal.fire({
              type: "error",
              heightAuto: false,
              title: 'No URLs were found in your website\'s sitemap at either /sitemap.xml or /wp-sitemap.xml. Please make sure the sitemap is accessible publicly, not requiring any authentication, not behind a maintenance page etc.',
            });
          }

          if (response.data.status == "scan_pending" || response.data.status == "pending" || response.data.status == "finished") {
            var total_pages = response.data.total_pages;
            var total_links = response.data.total_links;
            var total_finished = response.data.total_finished;

            var stats_html = "";
            stats_html += '<span class="lh-results-links-total"><strong>Total pages:</strong> ' + (response.data.total_pages ? response.data.total_pages : 0) + "</span>";
            stats_html += '<span class="lh-results-links-finished"><strong>Total links:</strong> ' + (response.data.total_pages ? response.data.total_links : 0) + "</span>";
            stats_html += '<span class="lh-results-links-error"><strong>Total problematic:</strong> ' + (response.data.total_pages ? response.data.total_error : 0) + "</span>";
            $(".lh-results-stats").html(stats_html);

            if (response.data.status == "finished") {
              var pagination_html = "";
              var pagination_pages_html = "<ul>";
              var per_page = parseInt($("#lh-per-page").val());
              var page_count = Math.floor(response.data.total_pages / per_page) + 1;
              $(".lh-search-wrapper").show();
              $(".lh-per-page-wrapper").css("display", "inline-block");
              $(".loading-message").remove();
              if (response.data.total_pages > per_page) {
                $(".lh-pagination").show();
                $(".lh-pagination-pages").show();
                pagination_pages_html += '<li data-page="1" ' + (response.data.current_page == 1 ? 'class="disabled"' : "") + ">First</li>";
                pagination_pages_html += '<li data-page="1" ' + (response.data.current_page == 1 ? 'class="disabled current"' : "") + ">1</li>";
                if (response.data.current_page > 3) {
                  pagination_pages_html += '<li class="disabled">...</li>';
                }
                pagination_html += '<label for="lh-pagination-page">Page:</label><select style="width:70px;" id="lh-pagination-page">';
                for (var p = 1; p <= page_count; p++) {
                  if (p != 1 && p != page_count && p - response.data.current_page <= 2 && p - response.data.current_page >= -2) {
                    pagination_pages_html += '<li data-page="' + p + '" ' + (response.data.current_page == p ? 'class="current disabled"' : "") + ">" + p + "</li>";
                  }
                  pagination_html += '<option value="' + p + '" ' + (response.data.current_page == p ? "selected" : "") + ">" + p + "</option>";
                }
                pagination_html += "</select>";
                if (response.data.current_page < page_count - 3) {
                  pagination_pages_html += '<li class="disabled">...</li>';
                }
                pagination_pages_html += '<li data-page="' + page_count + '" ' + (response.data.current_page == page_count ? 'class="disabled"' : "") + ">" + page_count + "</li>";
                pagination_pages_html += '<li data-page="' + page_count + '" ' + (response.data.current_page == page_count ? 'class="disabled"' : "") + ">Last</li>";
                $(".lh-pagination").html(pagination_html);
                $(".lh-pagination-pages").html(pagination_pages_html);
              } else {
                $(".lh-pagination").hide();
                $(".lh-pagination-pages").hide();
              }

              for (page in response.data.pages) {
                total_pages++;
                var page_id = page.replace(/p/g, "");
                var html = "";

                html += '<td class="lh-page-href">';
                if (response.data.pages[page].title && response.data.pages[page].title.length > 0) {
                  html += response.data.pages[page].title + " - ";
                }

                html += '<a href="' + response.data.pages[page].href + '" target="_blank">' + response.data.pages[page].href + '<span class="dashicons dashicons-external"></span></a>';
                html += "</td>";

                html += '<td style="width:140px" class="lh-results-stats">';

                if (response.data.pages[page].links_total != 0) {
                  html += '<span class="lh-results-links-total">' + response.data.pages[page].links_total + " links</span>";
                  html += '<span class="lh-results-links-finished">' + response.data.pages[page].links_finished + " passed</span>";
                  if (response.data.pages[page].links_error > 0) {
                    html += '<span class="lh-results-links-error">' + response.data.pages[page].links_error + " problematic</span>";
                  }
                }
                html += "</td>";

                html += "<td style='width:140px'>";
                //Show loader
                if (response.data.pages[page].links_total == 0) {
                  html += '<span class="lh-results-links-error">Timeout error. The page could not be scanned.</span>';
                } else {
                  html += '<div class="button button-gray lh-open-analysis">Open Details</div>';
                }
                html += "</td>";

                if ($("#lh_results #linkhero-page-" + page_id).length > 0) {
                  if ($("#linkhero-page-" + page_id).text() != $("<div>").append(html).text()) {
                    $("#linkhero-page-" + page_id).html(html);
                  }
                } else {
                  $("#lh_results").append('<tr class="lh-page" id="linkhero-page-' + page_id + '" data-page="' + page + '">' + html + "</tr>");
                }
              }
            } else {
              $(".lh-search-wrapper").hide();
              var progress = (total_finished / total_links) * 100;
              if (progress > 96 && response.data.total_errors > 0) {
                $("#lh_results").html('<div class="loading-message">' + loader_html + " Please wait, failed link are being rescanned.<br />Once the scan is finished, detailed, per page results will be available.</div>");
              } else {
                $("#lh_results").html('<div class="loading-message">' + loader_html + " Please wait, your links are being scanned.<br />Once the scan is finished, detailed, per page results will be available.</div>");
              }
            }

            if (response.data.total_pages > 0) {
              $(".lh-results-loader").remove();
              if (typeof total_error !== "undefined") {
                total_finished = total_finished + total_error;
              }

              if (response.data.status == "pending" && total_finished < total_links) {
                $("#lh-progress-bar-wrapper").show();
                var progress = (total_finished / total_links) * 100;
                $("#lh-progress-bar").css("width", progress + "%");
              } else {
                $("#lh-progress-bar-wrapper").hide();
              }

              if (response.data.total_pages > total_pages) {
                var unscanned_pages = response.data.total_pages - total_pages;
                $("#lh_pro_count").html(unscanned_pages);
                $("#lh_pro").show();
              } else {
                $("#lh_pro").hide();
              }
            } else {
              $(".lh-search-wrapper").hide();
            }

            if (response.data.status == "pending") {
              check_links_timeout = setTimeout(function () {
                check_links();
              }, 3000);
            }
          }
        } else {
          $("#lh_results").hide();
          $(".lh-search-wrapper").hide();
          if (lh_failed_retries < 3) {
            lh_failed_retries++;
            check_links_timeout = setTimeout(function () {
              check_links();
            }, 3000);
            return;
          }
          lh_failed_retries = 0;
          clearTimeout(check_links_timeout);
          wf301_swal.fire({
            type: "error",
            heightAuto: false,
            title: response.data,
          });
        }
      })
      .fail(function (data) {
        if (lh_failed_retries < 3) {
          lh_failed_retries++;
          check_links_timeout = setTimeout(function () {
            check_links();
          }, 3000);
          return;
        }
        lh_failed_retries = 0;
        wf301_swal.fire({
            type: "error",
            heightAuto: false,
            title: "An undocumented error occured processing the links. Please refresh the page. If the error persists please contact WP 301 Support.",
          });
      });
  } // check_links

  var analysis_table = false;
  $("#lh_results").on("click", ".lh-open-analysis", function () {
    var page = $(this).parents(".lh-page").attr("data-page");
    var title = $(this).parents(".lh-page").children(".lh-page-href").html();

    $("#lh_details_title").html(title);

    if (analysis_table != false) {
      analysis_table.destroy();
      analysis_table = false;
    }

    analysis_table = $("#lh_page_details").DataTable({
      ajax: ajaxurl + "?action=linkhero_run_tool&tool=link_details&page=" + page,
      columnDefs: [
        {
          targets: [0],
          className: "dt-body-center",
          width: 60,
        },
        {
          targets: [5, 6, 7, 8, 9, 10, 11],
          className: "dt-body-center",
          width: 60,
        },
        {
          targets: [1, 2, 3],
          className: "dt-body-left dt-head-center",
        },
      ],
      fixedColumns: true,
    });

    $("#lh_details").show();
    $("body").addClass("body_lh_details_open");
  });

  $(document).keydown(function(e) {
    if (e.keyCode == 27) {
        $("#lh_details").hide();
    }
  });

  $("#lh_details").on("click", ".lh-close", function () {
    $("#lh_details").hide();
    $("body").removeClass("body_lh_details_open");
  });

  $("#lh-search").on("change, keyup", function () {
    var search_term = $(this).val();
    var $rows = $("#lh_results tr");
    $rows
      .show()
      .filter(function () {
        var text = $(this).text().replace(/\s+/g, " ").toLowerCase();
        return !~text.indexOf(search_term);
      })
      .hide();
  });
});
