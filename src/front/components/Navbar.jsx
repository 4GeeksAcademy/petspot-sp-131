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