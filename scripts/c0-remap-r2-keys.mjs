/**
 * C0 — copy Drive-imported R2 objects to URL-safe keys.
 *
 * Usage (from repo root, rclone remotes `r2` + bucket already configured):
 *   node scripts/c0-remap-r2-keys.mjs           # copy
 *   node scripts/c0-remap-r2-keys.mjs --dry-run
 *   node scripts/c0-remap-r2-keys.mjs --delete-old
 */
import { spawnSync } from "node:child_process";

const BUCKET = "zeemkolo-technical-solutions";
const dryRun = process.argv.includes("--dry-run");
const deleteOld = process.argv.includes("--delete-old");

/** @type {{ from: string, to: string, visibility: "public" | "private", consumer: string }[]} */
export const KEY_MAP = [
  // Marketing banners (public)
  {
    from: "Banner/Banner 3.png",
    to: "marketing/banners/banner-3.png",
    visibility: "public",
    consumer: "C2 marketing / hero",
  },
  {
    from: "Banner/Smart Homes Banner.png",
    to: "marketing/banners/smart-homes-banner.png",
    visibility: "public",
    consumer: "C2 marketing / hero",
  },
  {
    from: "Banner/Zeemble Banner.png",
    to: "marketing/banners/zeemble-banner.png",
    visibility: "public",
    consumer: "C2 marketing / hero",
  },

  // Brand / icons (public)
  {
    from: "icon and pictures/logo icon_processed.jpg",
    to: "marketing/brand/logo-icon.jpg",
    visibility: "public",
    consumer: "C2 nav / brand",
  },
  {
    from: "icon and pictures/Untitled design (8).png",
    to: "marketing/brand/untitled-design-08.png",
    visibility: "public",
    consumer: "C2 marketing stills",
  },
  {
    from: "icon and pictures/Untitled design (9).png",
    to: "marketing/brand/untitled-design-09.png",
    visibility: "public",
    consumer: "C2 marketing stills",
  },
  {
    from: "icon and pictures/Untitled design (10).png",
    to: "marketing/brand/untitled-design-10.png",
    visibility: "public",
    consumer: "C2 marketing stills",
  },
  {
    from: "icon and pictures/Untitled design (11).png",
    to: "marketing/brand/untitled-design-11.png",
    visibility: "public",
    consumer: "C2 marketing stills",
  },
  {
    from: "icon and pictures/vanceai_1788697361471.jpg",
    to: "marketing/brand/vanceai-1788697361471.jpg",
    visibility: "public",
    consumer: "C2 marketing stills",
  },
  {
    from: "icon and pictures/vanceai_1788717910354.jpg",
    to: "marketing/brand/vanceai-1788717910354.jpg",
    visibility: "public",
    consumer: "C2 marketing stills",
  },
  {
    from: "icon and pictures/vanceai_1788718075274.jpg",
    to: "marketing/brand/vanceai-1788718075274.jpg",
    visibility: "public",
    consumer: "C2 marketing stills",
  },
  {
    from: "icon and pictures/vanceai_1788740565300.jpg",
    to: "marketing/brand/vanceai-1788740565300.jpg",
    visibility: "public",
    consumer: "C2 marketing stills",
  },

  // Store — radar kit
  {
    from: "Zeemble Store/Product 1/Image 1",
    to: "store/radar-kit/image-1.png",
    visibility: "public",
    consumer: "C1 product images",
  },
  {
    from: "Zeemble Store/Product 1/Image 2.png",
    to: "store/radar-kit/image-2.png",
    visibility: "public",
    consumer: "C1 product images",
  },
  {
    from: "Zeemble Store/Product 1/\u{1F4E6} The Zeemble Radar Kit.docx",
    to: "store/radar-kit/download/radar-kit-spec.docx",
    visibility: "private",
    consumer: "C1 digitalKey / signed download",
  },

  // Store — smart irrigation kit
  {
    from: "Zeemble Store/Product 2/image 1",
    to: "store/smart-irrigation-kit/image-1.png",
    visibility: "public",
    consumer: "C1 product images",
  },
  {
    from: "Zeemble Store/Product 2/Image 2.png",
    to: "store/smart-irrigation-kit/image-2.png",
    visibility: "public",
    consumer: "C1 product images",
  },
  {
    from: "Zeemble Store/Product 2/\u{1F4E6} The Zeemble Smart Irrigation Kit.docx",
    to: "store/smart-irrigation-kit/download/smart-irrigation-kit-spec.docx",
    visibility: "private",
    consumer: "C1 digitalKey / signed download",
  },

  // Course summaries (private authoring sources)
  {
    from: "Course Summary/Course 1- Zeemble Smart Distance Radar & Alert System.docx",
    to: "courses/radar-alert/summary.docx",
    visibility: "private",
    consumer: "C6 course authoring",
  },
  {
    from: "Course Summary/Course 2- ZEEMBLE Smart Irrigation Course .docx",
    to: "courses/smart-irrigation/summary.docx",
    visibility: "private",
    consumer: "C3 course authoring",
  },

  // Smart irrigation — root docs
  {
    from: "Smart Irrigation -Notes/Beginner\u2019s Guide to Smart Irrigation Systems.docx",
    to: "lessons/smart-irrigation/beginner-guide.docx",
    visibility: "private",
    consumer: "C4 course intro / extras",
  },
  {
    from: "Smart Irrigation -Notes/note plan.docx",
    to: "lessons/smart-irrigation/note-plan.docx",
    visibility: "private",
    consumer: "C4 authoring",
  },
  {
    from: "Smart Irrigation -Notes/script irrigation.docx",
    to: "lessons/smart-irrigation/script-irrigation.docx",
    visibility: "private",
    consumer: "C4 authoring",
  },
  {
    from: "Smart Irrigation -Notes/ZEEMBLE_Smart_Irrigation_Lesson_1.docx",
    to: "lessons/smart-irrigation/lesson-01/body.docx",
    visibility: "private",
    consumer: "C4 markdown conversion source",
  },
  {
    from: "Smart Irrigation -Notes/ZEEMBLE_Smart_Irrigation_Lesson_5.docx",
    to: "lessons/smart-irrigation/lesson-05/body.docx",
    visibility: "private",
    consumer: "C4 markdown conversion source",
  },
  {
    from: "Smart Irrigation -Notes/ZEEMBLE_Smart_Irrigation_Lesson_6.docx",
    to: "lessons/smart-irrigation/lesson-06/body.docx",
    visibility: "private",
    consumer: "C4 markdown conversion source",
  },
  {
    from: "Smart Irrigation -Notes/ZEEMBLE_Smart_Irrigation_Lesson_7.docx",
    to: "lessons/smart-irrigation/lesson-07/body.docx",
    visibility: "private",
    consumer: "C4 markdown conversion source",
  },
  {
    from: "Smart Irrigation -Notes/ZEEMBLE_Smart_Irrigation_Lesson_8.docx",
    to: "lessons/smart-irrigation/lesson-08/body.docx",
    visibility: "private",
    consumer: "C4 markdown conversion source",
  },

  // Lesson 2
  {
    from: "Smart Irrigation -Notes/Lesson 2/ZEEMBLE_Smart_Irrigation_Lesson_2.docx",
    to: "lessons/smart-irrigation/lesson-02/body.docx",
    visibility: "private",
    consumer: "C4 markdown conversion source",
  },
  {
    from: "Smart Irrigation -Notes/Lesson 2/Diagram.png",
    to: "lessons/smart-irrigation/lesson-02/diagram.png",
    visibility: "public",
    consumer: "C4 schematicKey / public schematics mirror",
  },
  {
    from: "Smart Irrigation -Notes/Lesson 2/Lesson 2- RGB LED.m4a",
    to: "lessons/smart-irrigation/lesson-02/rgb-led.m4a",
    visibility: "private",
    consumer: "C5 A/V",
  },
  {
    from: "Smart Irrigation -Notes/Lesson 2/Screen Recording 2026-09-23 at 2.16.52 PM.mov",
    to: "lessons/smart-irrigation/lesson-02/screen-recording.mov",
    visibility: "private",
    consumer: "C5 A/V",
  },
  {
    from: "Smart Irrigation -Notes/Lesson 2/Assignment/BLUE.png",
    to: "lessons/smart-irrigation/lesson-02/assignment/blue.png",
    visibility: "public",
    consumer: "C4 lesson assets",
  },
  {
    from: "Smart Irrigation -Notes/Lesson 2/Assignment/GREEN.png",
    to: "lessons/smart-irrigation/lesson-02/assignment/green.png",
    visibility: "public",
    consumer: "C4 lesson assets",
  },
  {
    from: "Smart Irrigation -Notes/Lesson 2/Assignment/RED.png",
    to: "lessons/smart-irrigation/lesson-02/assignment/red.png",
    visibility: "public",
    consumer: "C4 lesson assets",
  },
  {
    from: "Smart Irrigation -Notes/Lesson 2/Assignment/GREEN+BLUE.png",
    to: "lessons/smart-irrigation/lesson-02/assignment/green-blue.png",
    visibility: "public",
    consumer: "C4 lesson assets",
  },
  {
    from: "Smart Irrigation -Notes/Lesson 2/Assignment/RED+BLUE.png",
    to: "lessons/smart-irrigation/lesson-02/assignment/red-blue.png",
    visibility: "public",
    consumer: "C4 lesson assets",
  },
  {
    from: "Smart Irrigation -Notes/Lesson 2/Assignment/RED+GREEN.png",
    to: "lessons/smart-irrigation/lesson-02/assignment/red-green.png",
    visibility: "public",
    consumer: "C4 lesson assets",
  },

  // Lesson 3
  {
    from: "Smart Irrigation -Notes/lesson 3/ZEEMBLE_Smart_Irrigation_Lesson_3.docx",
    to: "lessons/smart-irrigation/lesson-03/body.docx",
    visibility: "private",
    consumer: "C4 markdown conversion source",
  },
  {
    from: "Smart Irrigation -Notes/lesson 3/lesson 3 diagram.png",
    to: "lessons/smart-irrigation/lesson-03/diagram.png",
    visibility: "public",
    consumer: "C4 schematicKey",
  },
  {
    from: "Smart Irrigation -Notes/lesson 3/Lesson 3  video.mov",
    to: "lessons/smart-irrigation/lesson-03/video.mov",
    visibility: "private",
    consumer: "C5 A/V",
  },
  {
    from: "Smart Irrigation -Notes/lesson 3/assigment/lesson 3 assignment- scenerio 1.png",
    to: "lessons/smart-irrigation/lesson-03/assignment/scenario-1.png",
    visibility: "public",
    consumer: "C4 lesson assets",
  },
  {
    from: "Smart Irrigation -Notes/lesson 3/assigment/scenerio 2.png",
    to: "lessons/smart-irrigation/lesson-03/assignment/scenario-2.png",
    visibility: "public",
    consumer: "C4 lesson assets",
  },
  {
    from: "Smart Irrigation -Notes/lesson 3/assigment/scenerio 3.png",
    to: "lessons/smart-irrigation/lesson-03/assignment/scenario-3.png",
    visibility: "public",
    consumer: "C4 lesson assets",
  },

  // Lesson 4
  {
    from: "Smart Irrigation -Notes/Lesson 4/ZEEMBLE_Smart_Irrigation_Lesson_4.docx",
    to: "lessons/smart-irrigation/lesson-04/body.docx",
    visibility: "private",
    consumer: "C4 markdown conversion source",
  },
  {
    from: "Smart Irrigation -Notes/Lesson 4/Lesson 4- circuit diagram.png",
    to: "lessons/smart-irrigation/lesson-04/circuit-diagram.png",
    visibility: "public",
    consumer: "C4 schematicKey",
  },
  {
    from: "Smart Irrigation -Notes/Lesson 4/Lesson 4- video.mov",
    to: "lessons/smart-irrigation/lesson-04/video.mov",
    visibility: "private",
    consumer: "C5 A/V",
  },
];

function rclone(args) {
  // No shell — paths contain spaces; let spawn pass argv intact.
  const r = spawnSync("rclone", args, {
    encoding: "utf8",
    shell: false,
    windowsHide: true,
  });
  if (r.status !== 0) {
    const err = (r.stderr || r.stdout || "").trim();
    throw new Error(
      `rclone ${args.map((a) => JSON.stringify(a)).join(" ")} failed (${r.status}): ${err}`,
    );
  }
  return r.stdout;
}

function main() {
  console.log(
    `C0 remap: ${KEY_MAP.length} objects → r2:${BUCKET} (${dryRun ? "dry-run" : "copy"}${deleteOld ? ", delete-old" : ""})`,
  );

  let ok = 0;
  for (const row of KEY_MAP) {
    const src = `r2:${BUCKET}/${row.from}`;
    const dst = `r2:${BUCKET}/${row.to}`;
    console.log(`${dryRun ? "DRY" : "COPY"} ${row.from} → ${row.to}`);
    if (!dryRun) {
      rclone(["copyto", src, dst]);
    }
    ok += 1;
  }

  console.log(`Done: ${ok}/${KEY_MAP.length}`);

  if (deleteOld && !dryRun) {
    const oldPrefixes = [
      "Banner",
      "icon and pictures",
      "Zeemble Store",
      "Course Summary",
      "Smart Irrigation -Notes",
    ];
    for (const prefix of oldPrefixes) {
      console.log(`DELETE prefix ${prefix}/`);
      rclone(["purge", `r2:${BUCKET}/${prefix}`]);
    }
  }

  if (dryRun) {
    console.log("Re-run without --dry-run to copy. Add --delete-old after verify.");
  }
}

const isMain = process.argv[1] && process.argv[1].replaceAll("\\", "/").endsWith("c0-remap-r2-keys.mjs");
if (isMain) {
  try {
    main();
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  }
}
