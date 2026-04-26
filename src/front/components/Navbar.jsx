import React from "react";
import { Link } from "react-router-dom";

export const Navbar = () => {
	return (
		<nav className="navbar navbar-light bg-light">
			<div className="container">
				<Link to="/">
					<span className="navbar-brand mb-0 h1">React Boilerplate</span>
				</Link>
				<div className="d-flex gap-2 align-items-center flex-wrap">
					<Link to="/reservations">
						<button className="btn btn-primary">Reservations</button>
					</Link>

					<Link to="/news">
                        <button className="btn btn-primary">News</button>
                    </Link>

					<Link to="/tell-me-more">
						<button
							className="btn"
							style={{
								background: "linear-gradient(135deg, #7c3aed, #a855f7)",
								color: "white",
								fontWeight: 600,
								border: "none",
								boxShadow: "0 4px 15px rgba(124, 58, 237, 0.35)",
								transition: "all 0.2s",
							}}
							onMouseEnter={e => {
								e.currentTarget.style.transform = "translateY(-2px)";
								e.currentTarget.style.boxShadow = "0 8px 25px rgba(124, 58, 237, 0.5)";
							}}
							onMouseLeave={e => {
								e.currentTarget.style.transform = "translateY(0)";
								e.currentTarget.style.boxShadow = "0 4px 15px rgba(124, 58, 237, 0.35)";
							}}
						>
							✨ Tell me more about it
						</button>
					</Link>

					<Link to="/login/user">
						<button className="btn btn-outline-primary">Login</button>
					</Link>

					<Link to="/signup/user">
						<button className="btn btn-success">Signup</button>
					</Link>
				</div>
			</div>
		</nav>
	);
};
