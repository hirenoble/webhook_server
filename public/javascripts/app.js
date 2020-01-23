$(function() {
            'use strict';

            var currentUri = null;
            var socketUrl = window.location.protocol + '//' + window.location.host;
            var socket;

            /* please update this to your own slack webhook incoming url
            and the appropriate slack channel */
            var slackWebhook = "https://hooks.slack.com/services/<unique_code>";

            var slackChannel = "customer_service";


            $('#connectForm').submit(function(e) {




                    e.preventDefault();
                    if (currentUri) {
                        socket.removeAllListeners(currentUri);
                    }
                    socket = io.connect(socketUrl);
                    socket.on('connection', function(data) {
                        $('#log-list').append('<li class="list-group-item">Connected to server</li>');
                        console.log(data);
                    });

                    var uri = $('#webhookUri').val().trim();

                    var currentUri = uri === '*' ? 'webhookEvent:all' : 'webhookEvent:' + uri;

                    var webhookUrl = socketUrl + '/webhook/' + uri
                    $('#log-list').prepend($('<li></li>').attr('class', 'list-group-item').html('Connected to: <a target="_blank" href="' + webhookUrl + '">' + webhookUrl + '</a>'));

                    socket.on(currentUri, function(event, data) {
                            addLog(event);
                            //console.log(currentUri, event, data);
                            var mes;
                            var attachments_color_green = "#008000";
                            try {
                                var trigger = event.body.event["com.adobe.mcloud.pipeline.pipelineMessage"]["com.adobe.mcloud.protocol.trigger"];
                                var payload = {
                                    "channel": slackChannel,
                                    "username": "incoming-webhook",
                                    "mrkdwn": true,
                                    "attachments": [{
                                        "text": "A user with visitor_id " + trigger.mcId + " has abandoned the cart. He visited these pages:\n" + trigger.enrichments.analyticsHitSummary.dimensions.pageURL.data.join("\r\n").replace("\r\n\r\n", "\r\n"),
                                        "fallback": "You have received a new message from io_triggers!",
                                        "color": attachments_color_green,
                                        "attachment_type": "default"
                                    }]
                                };
                                mes = JSON.stringify(payload);
                            } catch (err) {
                                console.log("Something Went Wrong: " + err.message);
                                }

                                /*
                                 * post message to Slack
                                 */
                                
                                if (mes) {
                                    postToSlack(mes);
                                }

                            });
                        
                    });


                function listen(uri) {

                }

                window.toggleListItem = function(item) {
                    $(item).next('.list-group-item-body').toggle();
                }

                function addLog(log) {
                    $('#logItemTemplate').tmpl(log).prependTo('#log-list')
                }

                function postToSlack(mes) {
                    $.ajax({
                        url: slackWebhook,
                        type: 'POST',
                        processData: true,
                        data: mes,
                        // result will show on console
                        success: function(data) {
                            console.log("SUCCESS: " + data);
                        },
                        error: function(data) {
                            console.log("ERROR: " + data);
                        }
                    });
                }


            });
