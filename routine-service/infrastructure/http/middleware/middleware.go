// ============================================================
// INFRASTRUCTURE - HTTP Middleware
// ============================================================
// Middleware compartido para CORS, logging, etc.
// ============================================================

package middleware

import (
	"log"
	"net/http"
	"time"
)

// CORS permite requests desde el frontend en desarrollo.
func CORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Max-Age", "86400")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// Logger registra cada petición HTTP con su duración.
func Logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// wrappedWriter para capturar el status code
		wrapped := &statusResponseWriter{ResponseWriter: w, statusCode: http.StatusOK}

		next.ServeHTTP(wrapped, r)

		log.Printf(
			"[%s] %s %s %d %v",
			r.Method,
			r.RequestURI,
			r.RemoteAddr,
			wrapped.statusCode,
			time.Since(start),
		)
	})
}

// statusResponseWriter captura el status code de la respuesta.
type statusResponseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (w *statusResponseWriter) WriteHeader(code int) {
	w.statusCode = code
	w.ResponseWriter.WriteHeader(code)
}
