(function ($) {
    $.fn.quickPagination = function (options) {
        var defaults = {
            pageSize: 10,
            currentPage: 1,
            holder: null,
            pagerLocation: "after"
        };
        var options = $.extend(defaults, options);
        return this.each(function () {
            var selector = $(this);
            var pageCounter = 1;
            selector.wrap("<div class='simplePagerContainer'></div>");
            selector.parents(".simplePagerContainer").find("ul.simplePagerNav").remove();
            selector.children().each(function (i) {
                if (i < pageCounter * options.pageSize && i >= (pageCounter - 1) * options.pageSize) {
                    $(this).addClass("simplePagerPage" + pageCounter);
                } else {
                    $(this).addClass("simplePagerPage" + (pageCounter + 1));
                    pageCounter++;
                }
            });
            selector.children().hide();
            selector.children(".simplePagerPage" + options.currentPage).show();
            if (pageCounter <= 1) {
                return;
            }
            var pageNav = "<span class='simplePagerNav'>";
            for (i = 1; i <= pageCounter; i++) {
                if (i == options.currentPage) {
                    pageNav += "<a rel='" + i + "' href='#'>" + i + "</a> ";
                } else {
                    pageNav += "<a rel='" + i + "' href='#'>" + i + "</a> ";
                }
            }
            pageNav += "</span>";
            if (!options.holder) {
                switch (options.pagerLocation) {
                    case "before":
                        selector.before(pageNav);
                        break;
                    case "both":
                        selector.before(pageNav);
                        selector.after(pageNav);
                        break;
                    default:
                        selector.after(pageNav);
                }
            } else {
                $(options.holder).append(pageNav);
            }
            selector.parent().find(".simplePagerNav a").click(function () {
                var clickedLink = $(this).attr("rel");
                options.currentPage = clickedLink;
                if (options.holder) {
                    $(this).parent("li").parent("ul").parent(options.holder).find("li.currentPage").removeClass("currentPage");
                    $(this).parent("li").parent("ul").parent(options.holder).find("a[rel='" + clickedLink + "']").parent("li").addClass("currentPage");
                } else {
                    $(this).parent("li").parent("ul").parent(".simplePagerContainer").find("li.currentPage").removeClass("currentPage");
                    $(this).parent("li").parent("ul").parent(".simplePagerContainer").find("a[rel='" + clickedLink + "']").parent("li").addClass("currentPage");
                }
                selector.children().hide();
                selector.find(".simplePagerPage" + clickedLink).show();
                return false;
            });
        });
    }
})(jQuery);