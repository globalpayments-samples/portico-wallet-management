namespace CardPaymentSample;

/// <summary>
/// Mock responses for testing wallet management scenarios
/// </summary>
public static class MockResponses
{
    /// <summary>
    /// Generate mock stored payment token
    /// </summary>
    public static string GenerateMockStoredPaymentToken()
    {
        return $"token_{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}_{Guid.NewGuid().ToString().Replace("-", "")[..16]}";
    }
}