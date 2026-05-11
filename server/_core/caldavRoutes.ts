import { Router, Request, Response } from "express";
import * as caldav from "./caldav";
import * as dbHelpers from "../db";

export const caldavRouter = Router();

/**
 * CalDAV PROPFIND - List calendar resources
 */
caldavRouter.propfind("/:representativeId/:token", async (req, res) => {
  try {
    const { representativeId, token } = req.params;

    // Validate token
    const calendar = caldav.getCalDAVCalendarByToken(token);
    if (!calendar || calendar.representativeId !== parseInt(representativeId)) {
      return res.status(401).send("Unauthorized");
    }

    // Return calendar collection
    const xmlResponse = `<?xml version="1.0" encoding="utf-8"?>
<D:multistatus xmlns:D="DAV:" xmlns:CS="http://calendarserver.org/ns/">
  <D:response>
    <D:href>/api/caldav/calendar/${representativeId}/${token}/</D:href>
    <D:propstat>
      <D:prop>
        <D:resourcetype>
          <D:collection/>
          <CS:calendar/>
        </D:resourcetype>
        <D:displayname>${calendar.name}</D:displayname>
        <D:getcontenttype>text/calendar; charset="utf-8"</D:getcontenttype>
      </D:prop>
      <D:status>HTTP/1.1 200 OK</D:status>
    </D:propstat>
  </D:response>
</D:multistatus>`;

    res.set("Content-Type", "application/xml; charset=utf-8");
    res.set("DAV", "1, 3, extended-mkcol, calendar-access");
    res.status(207).send(xmlResponse);
  } catch (error) {
    console.error("CalDAV PROPFIND error:", error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * CalDAV GET - Retrieve calendar feed
 */
caldavRouter.get("/:representativeId/:token", async (req, res) => {
  try {
    const { representativeId, token } = req.params;

    // Validate token
    const calendar = caldav.getCalDAVCalendarByToken(token);
    if (!calendar || calendar.representativeId !== parseInt(representativeId)) {
      return res.status(401).send("Unauthorized");
    }

    // Generate calendar feed
    const icsContent = await caldav.generateCalendarFeed(
      parseInt(representativeId)
    );

    res.set("Content-Type", "text/calendar; charset=utf-8");
    res.set("Content-Disposition", `attachment; filename="calendar.ics"`);
    res.set("Cache-Control", "max-age=3600");
    res.status(200).send(icsContent);
  } catch (error) {
    console.error("CalDAV GET error:", error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * CalDAV OPTIONS - Return supported methods
 */
caldavRouter.options("/:representativeId/:token", (req, res) => {
  res.set("Allow", "OPTIONS, GET, HEAD, PROPFIND, REPORT");
  res.set("DAV", "1, 3, extended-mkcol, calendar-access");
  res.status(200).send("");
});

/**
 * CalDAV REPORT - Handle calendar queries
 */
caldavRouter.report("/:representativeId/:token", async (req, res) => {
  try {
    const { representativeId, token } = req.params;

    // Validate token
    const calendar = caldav.getCalDAVCalendarByToken(token);
    if (!calendar || calendar.representativeId !== parseInt(representativeId)) {
      return res.status(401).send("Unauthorized");
    }

    // Generate calendar feed for report
    const icsContent = await caldav.generateCalendarFeed(
      parseInt(representativeId)
    );

    const xmlResponse = `<?xml version="1.0" encoding="utf-8"?>
<D:multistatus xmlns:D="DAV:" xmlns:CS="http://calendarserver.org/ns/">
  <D:response>
    <D:href>/api/caldav/calendar/${representativeId}/${token}/</D:href>
    <D:propstat>
      <D:prop>
        <D:getcontenttype>text/calendar; charset="utf-8"</D:getcontenttype>
      </D:prop>
      <D:status>HTTP/1.1 200 OK</D:status>
    </D:propstat>
  </D:response>
</D:multistatus>`;

    res.set("Content-Type", "application/xml; charset=utf-8");
    res.status(207).send(xmlResponse);
  } catch (error) {
    console.error("CalDAV REPORT error:", error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * Add custom method support for PROPFIND, REPORT, etc.
 */
export function setupCalDAVMethods(app: any) {
  // Add PROPFIND method
  app.propfind = function (path: string, handler: any) {
    app._router.stack.push({
      route: path,
      name: "propfind",
      regexp: new RegExp(`^${path.replace(/\//g, "\\/")}$`),
      keys: [],
      method: "propfind",
      handler,
    });
  };

  // Add REPORT method
  app.report = function (path: string, handler: any) {
    app._router.stack.push({
      route: path,
      name: "report",
      regexp: new RegExp(`^${path.replace(/\//g, "\\/")}$`),
      keys: [],
      method: "report",
      handler,
    });
  };

  // Middleware to handle custom methods
  app.use((req: Request, res: Response, next: any) => {
    const method = req.method.toLowerCase();
    if (method === "propfind" || method === "report") {
      // Find matching route
      for (const layer of app._router.stack) {
        if (layer.method === method && layer.regexp.test(req.path)) {
          return layer.handler(req, res, next);
        }
      }
    }
    next();
  });
}
