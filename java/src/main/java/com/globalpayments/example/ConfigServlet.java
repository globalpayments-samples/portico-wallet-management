package com.globalpayments.example;

import com.google.gson.Gson;
import io.github.cdimascio.dotenv.Dotenv;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * Configuration endpoint
 *
 * GET /config - Returns frontend configuration including public API key
 */
@WebServlet(name = "ConfigServlet", urlPatterns = {"/config"})
public class ConfigServlet extends HttpServlet {

    private static final Gson gson = new Gson();
    private final Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        // Add CORS headers
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

        // Get public API key from .env file
        String publicApiKey = dotenv.get("PUBLIC_API_KEY");
        if (publicApiKey == null || publicApiKey.isEmpty()) {
            publicApiKey = "pk_test_demo_key"; // Default for demo purposes
        }

        Map<String, Object> configData = new HashMap<>();
        configData.put("publicApiKey", publicApiKey);

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("success", true);
        responseData.put("data", configData);
        responseData.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        response.getWriter().write(gson.toJson(responseData));
    }

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.setStatus(HttpServletResponse.SC_OK);
    }
}
