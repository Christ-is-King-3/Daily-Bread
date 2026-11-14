"""Local deterministic tests for four daily health checks and page inventory."""
import unittest
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo
from health_recovery import ROOT, TIMES, References

class HealthTests(unittest.TestCase):
    def test_four_checks_each_uk_day(self):
        self.assertEqual(TIMES, {9, 11, 13, 15})
        for month in (1, 7):
            uk = ZoneInfo('Europe/London')
            checks = [datetime(2026, month, 14, h, 7, tzinfo=uk).utcoffset().total_seconds()/3600 for h in TIMES]
            self.assertEqual(len(checks), 4)
    def test_all_pages_included(self):
        pages = [p.name for p in ROOT.glob('*.html')]
        self.assertGreaterEqual(len(pages), 8)
        for required in ('index.html','news.html','church.html','scripture.html',
                         'journal.html','quizzes.html','art.html','contact.html'):
            self.assertIn(required,pages)
    def test_local_reference_validation(self):
        r=References()
        r.feed('<a href="news.html#world">News</a><script src="assets/site.js"></script>'
               '<a href="https://example.net/other">External</a>')
        self.assertEqual(r.local, {'news.html','assets/site.js'})

if __name__ == '__main__':
    unittest.main()
