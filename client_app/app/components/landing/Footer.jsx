import Brand from "./Brand.jsx";

export default function Footer() {
  return (
    <footer className="site-footer section-shell">
      <div className="footer-main" data-reveal><div><Brand footer /><p>Event-driven notifications, thoughtfully delivered.</p></div><div className="footer-links"><a href="#product">Product</a><a href="#workflow">How it works</a><a href="#developers">Developers</a><a href="#developers">Documentation</a></div></div>
      <div className="footer-bottom" data-reveal><span>© {new Date().getFullYear()} NotifyX</span><span>Built for the moments that matter.</span><a href="#top">Back to top ↑</a></div>
    </footer>
  );
}
