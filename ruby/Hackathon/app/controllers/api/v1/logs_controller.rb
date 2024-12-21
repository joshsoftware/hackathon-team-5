module Api
  module V1
    class LogsController < ApplicationController

      attr_reader :param

      def index

      end

      def create
        result = create_data

        if result
          render json:  { success: true }, status: :created
        else
          render json:  { success: false, error: "Internal error" }, status: :unprocessable_entity
        end
      end

      private

      def create_data
        @param = logs_params["logs"]
        param.each do |h|
        ActiveRecord::Base.transaction do
          create_action_item(h)
        end
        end
        true
      end

      def create_action_item(hash)
        action = Action.create(flow: hash["action_type"])
        action.reload
        create_url_item(hash, action.uid)
      end

      def create_url_item(hash, action_uid)
        url = Url.create(action_uid: action_uid, link: hash["url"])
        url.reload
        create_issue_item(hash, action_uid, url.uid)
      end

      def create_issue_item(hash, action_uid, url_uid)
        Issue.create(action_uid: action_uid, url_uid: url_uid, error_type: "console", issue: hash["console_error"] )
        Issue.create(action_uid: action_uid, url_uid: url_uid, error_type: "network", issue: hash["network_error"] )
      end

      def logs_params
        params.require(:log).permit(logs: [
          :action_type, :url, console_error: [], network_error: []
        ])
      end
    end
    end
  end